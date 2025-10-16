import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createRedirectUrl } from "@/lib/url-utils";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.dimito.ir";

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

    // Payment failed
    if (success === "0" || !success) {

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
        } catch (updateError) {
          console.error(
            "[Payment Callback] Failed to update intent on payment failure:",
            updateError
          );
        }
      }

      return NextResponse.redirect(
        createRedirectUrl(
          request,
          "/payment/failed",
          locale,
          { track_id: trackId || "unknown" }
        )
      );
    }

    // Payment successful - now check if there's a purchase intent
    if (success === "1" && trackId) {
      try {
        // Step 1: Check if there's a purchase intent for this track_id
        // Note: We get auth_token FROM the intent, not from cookies
        const intentResponse = await fetch(
          `${API_URL}/presale/payment-intent-by-track/${trackId}/`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
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
            createRedirectUrl(
              request,
              "/payment/success",
              locale,
              {
                track_id: trackId,
                auto_purchase: "false",
                reason: "intent_fetch_failed"
              }
            )
          );
        }

        const intentData = await intentResponse.json();

        // Check if intent exists and has purchase data
        if (!intentData.has_intent || !intentData.purchase_intent) {
          return NextResponse.redirect(
            createRedirectUrl(
              request,
              "/payment/success",
              locale,
              {
                track_id: trackId,
                auto_purchase: "false"
              }
            )
          );
        }

        const { purchase_intent, auth_token: intentAuthToken } = intentData;
        const authToken = intentAuthToken;

        // Step 2: Automatically purchase tokens using the stored intent
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

            if (!updateResponse.ok) {
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
            createRedirectUrl(
              request,
              "/payment/success",
              locale,
              {
                track_id: trackId,
                auto_purchase: "failed",
                error: errorData.error_description || "Purchase failed"
              }
            )
          );
        }

        const purchaseData = await purchaseResponse.json();

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

          if (!updateResponse.ok) {
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
          createRedirectUrl(
            request,
            "/payment/success",
            locale,
            {
              track_id: trackId,
              auto_purchase: "true",
              token_amount: purchase_intent.token_amount,
              token_symbol: purchase_intent.token_symbol
            }
          )
        );
      } catch (error) {
        console.error("[Payment Callback] Error in auto-purchase flow:", error);

        // Error during auto-purchase - still show success for payment
        return NextResponse.redirect(
          createRedirectUrl(
            request,
            "/payment/success",
            locale,
            {
              track_id: trackId,
              auto_purchase: "failed",
              error: error.message
            }
          )
        );
      }
    }

    // Fallback - redirect to home
    return NextResponse.redirect(
      createRedirectUrl(
        request,
        "/",
        locale
      )
    );
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
      createRedirectUrl(
        request,
        "/payment/error",
        locale,
        { error: error.message }
      )
    );
  }
}
