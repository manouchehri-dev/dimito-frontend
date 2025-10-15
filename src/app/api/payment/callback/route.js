import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.dimito.ir";

/**
 * Payment Gateway Callback Handler
 *
 * This route receives callbacks from the iCart payment gateway after
 * the user completes payment. It validates the payment and automatically
 * purchases tokens if a purchase intent was stored.
 *
 * Expected callback URL from gateway:
 * /api/payment/callback?success=1&track_id=4300451487&auth_token=XXX
 *
 * Query Parameters:
 * - success: 1 for success, 0 for failure
 * - track_id: Payment tracking ID from gateway
 * - auth_token: (Optional) Auth token passed from client via redirect_url
 */
export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const success = searchParams.get("success");
    const trackId = searchParams.get("track_id");

    // Get locale from cookie or default to 'en'
    const cookieStore = await cookies();
    const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

    // Get auth token from localStorage (passed via query param from gateway)
    // Or from cookie if available (for SSR)
    const authTokenFromQuery = searchParams.get("auth_token");
    const authTokenFromCookie = cookieStore.get("auth_token")?.value;
    const authToken = authTokenFromQuery || authTokenFromCookie;

    console.log(
      `[Payment Callback] Received: success=${success}, track_id=${trackId}`
    );

    // Payment failed
    if (success === "0" || !success) {
      console.log(`[Payment Callback] Payment failed for track_id: ${trackId}`);

      // Update intent to mark payment as failed (if track_id exists)
      if (trackId && authToken) {
        try {
          await fetch(`${API_URL}/presale/update-payment-intent/${trackId}/`, {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              payment_completed: false,
              tokens_purchased: false,
              purchase_error: "Payment failed or cancelled by user",
              completed_at: new Date().toISOString(),
            }),
          });
          console.log(
            `[Payment Callback] Intent updated (payment failed) for track_id: ${trackId}`
          );
        } catch (updateError) {
          console.error(
            "[Payment Callback] Failed to update intent on payment failure:",
            updateError
          );
        }
      }

      return NextResponse.redirect(
        new URL(
          `/${locale}/payment/failed?track_id=${trackId || "unknown"}`,
          request.url
        )
      );
    }

    // Payment successful - now check if there's a purchase intent
    if (success === "1" && trackId) {
      try {
        // Step 1: Check if there's a purchase intent for this track_id
        // Note: We get auth_token FROM the intent, not from cookies
        console.log(
          `[Payment Callback] Checking for purchase intent: ${trackId}`
        );
        console.log(
          `[Payment Callback] API URL: ${API_URL}/presale/payment-intent-by-track/${trackId}/`
        );

        const intentResponse = await fetch(
          `${API_URL}/presale/payment-intent-by-track/${trackId}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        console.log(
          `[Payment Callback] Intent response status: ${intentResponse.status}`
        );

        if (!intentResponse.ok) {
          const responseText = await intentResponse.text();
          console.error(
            `[Payment Callback] Intent retrieval failed for track_id: ${trackId}`,
            {
              status: intentResponse.status,
              response: responseText.substring(0, 200), // Log first 200 chars
            }
          );

          // No intent found or expired - just redirect to success page
          return NextResponse.redirect(
            new URL(
              `/${locale}/payment/success?track_id=${trackId}&auto_purchase=false&reason=intent_fetch_failed`,
              request.url
            )
          );
        }

        const intentData = await intentResponse.json();
        console.log(`[Payment Callback] Intent data received:`, intentData);

        // Check if intent exists and has purchase data
        if (!intentData.has_intent || !intentData.purchase_intent) {
          console.log(
            `[Payment Callback] Track ${trackId} has no purchase intent, showing success page`
          );
          return NextResponse.redirect(
            new URL(
              `/${locale}/payment/success?track_id=${trackId}&auto_purchase=false`,
              request.url
            )
          );
        }

        const { purchase_intent, auth_token: intentAuthToken } = intentData;
        const authToken = intentAuthToken;
        console.log(
          `[Payment Callback] Found purchase intent for ${purchase_intent.token_symbol}: ${purchase_intent.token_amount}`
        );

        // Step 2: Automatically purchase tokens using the stored intent
        console.log(
          `[Payment Callback] Attempting auto-purchase with slippage ${purchase_intent.slippage_percent}%...`
        );
        console.log(`[Payment Callback] Purchase details:`, {
          token_amount: purchase_intent.token_amount,
          rial_amount: purchase_intent.rial_amount,
          base_cost: purchase_intent.base_cost_rial,
          tax: purchase_intent.tax_amount_rial,
          tax_percent: purchase_intent.tax_percent,
        });

        const purchaseResponse = await fetch(
          `${API_URL}/presale/purchase-token/`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${authToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: parseFloat(purchase_intent.token_amount), // Convert from string to number
              asset_type: purchase_intent.asset_type,
              asset_id: purchase_intent.asset_id,
              unit: purchase_intent.unit,
              rial_amount: purchase_intent.rial_amount, // Use rial_amount field
              slippage_percent: purchase_intent.slippage_percent ?? 0.2, // Default 0.2% if not provided
              track_id: trackId, // ✅ PASS track_id to prevent duplicate intent creation
            }),
          }
        );

        if (!purchaseResponse.ok) {
          const errorData = await purchaseResponse.json();
          console.error("[Payment Callback] Auto-purchase failed:", errorData);

          // Update intent to mark purchase as failed
          try {
            const updateResponse = await fetch(
              `${API_URL}/presale/update-payment-intent/${trackId}/`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  payment_completed: true,
                  tokens_purchased: false,
                  purchase_error:
                    errorData.error_description || "Purchase failed",
                  completed_at: new Date().toISOString(),
                }),
              }
            );

            if (updateResponse.ok) {
              console.log(
                `[Payment Callback] Intent updated (purchase failed) for track_id: ${trackId}`
              );
            } else {
              const updateError = await updateResponse.json();
              console.error(
                "[Payment Callback] Failed to update intent:",
                updateError
              );
            }
          } catch (updateError) {
            console.error(
              "[Payment Callback] Failed to update intent on error:",
              updateError
            );
          }

          // Purchase failed - redirect with error
          return NextResponse.redirect(
            new URL(
              `/${locale}/payment/success?track_id=${trackId}&auto_purchase=failed&error=${encodeURIComponent(
                errorData.error_description || "Purchase failed"
              )}`,
              request.url
            )
          );
        }

        const purchaseData = await purchaseResponse.json();
        console.log(
          `[Payment Callback] Auto-purchase successful!`,
          purchaseData
        );

        // Step 3: Update purchase intent status to completed
        try {
          const updateResponse = await fetch(
            `${API_URL}/presale/update-payment-intent/${trackId}/`,
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_completed: true,
                tokens_purchased: true,
                completed_at: new Date().toISOString(),
              }),
            }
          );

          if (updateResponse.ok) {
            console.log(
              `[Payment Callback] Intent updated successfully for track_id: ${trackId}`
            );
          } else {
            const updateError = await updateResponse.json();
            console.error(
              "[Payment Callback] Failed to update intent:",
              updateError
            );
          }
        } catch (updateError) {
          console.error(
            "[Payment Callback] Failed to update intent:",
            updateError
          );
          // Don't fail the whole flow if update fails
        }

        // Step 4: Redirect to success page with purchase confirmation
        return NextResponse.redirect(
          new URL(
            `/${locale}/payment/success?track_id=${trackId}&auto_purchase=true&token_amount=${purchase_intent.token_amount}&token_symbol=${purchase_intent.token_symbol}`,
            request.url
          )
        );
      } catch (error) {
        console.error("[Payment Callback] Error in auto-purchase flow:", error);

        // Error during auto-purchase - still show success for payment
        return NextResponse.redirect(
          new URL(
            `/${locale}/payment/success?track_id=${trackId}&auto_purchase=failed&error=${encodeURIComponent(
              error.message
            )}`,
            request.url
          )
        );
      }
    }

    // Fallback - redirect to home
    console.warn(
      "[Payment Callback] No valid success/track_id, redirecting to home"
    );
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  } catch (error) {
    console.error("[Payment Callback] Unexpected error:", error);

    // Get locale safely
    let locale = "en";
    try {
      const cookieStore = await cookies();
      locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
    } catch (e) {
      // Cookie reading failed, use default
    }

    return NextResponse.redirect(
      new URL(
        `/${locale}/payment/error?error=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }
}
