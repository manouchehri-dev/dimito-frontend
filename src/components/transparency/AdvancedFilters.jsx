"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    Calendar,
    Filter,
    X,
    Tag,
    Mountain,
    MapPin,
} from "lucide-react";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "@/lib/utils";
import { useTokenOptions } from "@/lib/transparency/transparencyQueries";

/**
 * Advanced Filters Component
 * Comprehensive filtering system matching backend ReportFilter
 */
export default function AdvancedFilters({
    filters,
    onFiltersChange,
    onApplyFilters,
    onClearFilters,
    className
}) {
    const t = useTranslations("reports");
    const tCommon = useTranslations("common");
    const locale = useLocale();
    const isRTL = locale === "fa";

    // Component state
    const [isOpen, setIsOpen] = useState(false);
    const [localFilters, setLocalFilters] = useState(filters || {});
    const [hasActiveFilters, setHasActiveFilters] = useState(false);
    const [isClearing, setIsClearing] = useState(false);

    // React Query hooks for filter options
    const { data: tokenOptions, isLoading: loadingTokens } = useTokenOptions();

    // Auto-open filters if any are set
    useEffect(() => {
        const filterFields = ['title', 'date_from', 'date_to', 'token', 'author', 'search', 'mine_name', 'mine_location'];
        const hasFilters = Object.entries(filters || {}).some(([key, value]) =>
            filterFields.includes(key) && value !== null && value !== undefined && value !== ""
        );
        if (hasFilters) {
            setIsOpen(true);
        }
    }, [filters]);

    // Update local filters when props change (but not when we're clearing)
    useEffect(() => {
        if (!isClearing) {
            setLocalFilters(filters || {});
        }
    }, [filters, isClearing]);

    // Check if there are active filters
    useEffect(() => {
        const activeFilters = Object.values(localFilters).some(value =>
            value !== null && value !== undefined && value !== ""
        );
        setHasActiveFilters(activeFilters);
    }, [localFilters]);

    /**
     * Handle filter change
     */
    const handleFilterChange = (key, value) => {
        const newFilters = {
            ...localFilters,
            [key]: value === "" ? null : value,
        };
        setLocalFilters(newFilters);
        onFiltersChange?.(newFilters);
    };

    /**
     * Handle date input change
     */
    const handleDateChange = (key, value) => {
        if (!value) {
            handleFilterChange(key, null);
            return;
        }

        // Convert DateObject to ISO string for backend
        let isoDate;
        if (typeof value === 'string') {
            // Handle regular input date
            isoDate = new Date(value).toISOString();
        } else {
            // Handle DatePicker object
            isoDate = value.toDate().toISOString();
        }

        handleFilterChange(key, isoDate);
    };

    /**
     * Apply filters
     */
    const handleApplyFilters = () => {
        onApplyFilters?.(localFilters);
        setIsOpen(false);
    };

    /**
     * Clear all filters
     */
    const handleClearFilters = () => {
        setIsClearing(true);
        const clearedFilters = {};
        setLocalFilters(clearedFilters);

        // Immediately notify parent components
        onFiltersChange?.(clearedFilters);
        onApplyFilters?.(clearedFilters);
        onClearFilters?.();

        // Reset clearing flag after parent has processed
        setTimeout(() => {
            setIsClearing(false);
        }, 300);
    };

    /**
     * Clear individual filter
     */
    const handleClearIndividualFilter = (key) => {
        setIsClearing(true);
        const newFilters = { ...localFilters };
        delete newFilters[key]; // Completely remove the key

        setLocalFilters(newFilters);

        // Immediately notify parent components
        onFiltersChange?.(newFilters);
        onApplyFilters?.(newFilters);

        // Reset clearing flag after parent has processed
        setTimeout(() => {
            setIsClearing(false);
        }, 300);
    };

    /**
     * Get active filters count
     */
    const getActiveFiltersCount = () => {
        // Only count actual filter fields, not query parameters like ordering, page_size, page
        // Exclude 'title' and 'search' since they're now handled in the main search bar
        const filterFields = ['date_from', 'date_to', 'token', 'author', 'mine_name', 'mine_location'];
        return Object.entries(localFilters).filter(([key, value]) =>
            filterFields.includes(key) && value !== null && value !== undefined && value !== ""
        ).length;
    };

    /**
     * Format date for input (convert from ISO to appropriate format)
     */
    const formatDateForInput = (isoDate) => {
        if (!isoDate) return "";
        try {
            if (isRTL) {
                // For Persian, return DateObject for Jalali calendar
                const DateObject = require("react-date-object").default;
                return new DateObject(new Date(isoDate)).convert(persian, persian_fa);
            } else {
                // For English, return YYYY-MM-DD format
                return new Date(isoDate).toISOString().split('T')[0];
            }
        } catch {
            return "";
        }
    };

    /**
     * Render date picker based on locale
     */
    const renderDatePicker = (key, label) => {
        const value = formatDateForInput(localFilters[key]);

        if (isRTL) {
            // Persian Jalali date picker
            return (
                <div className="space-y-2">
                    <Label className="text-[#2D2D2D] font-medium flex items-center gap-2 font-iransans">
                        <Calendar className="w-4 h-4 text-[#FF4135]" />
                        {label}
                    </Label>
                    <div className="relative">
                        <DatePicker
                            value={value}
                            onChange={(date) => handleDateChange(key, date)}
                            calendar={persian}
                            locale={persian_fa}
                            calendarPosition="bottom-right"
                            format="YYYY/MM/DD"
                            className="custom-datepicker-rtl"
                            inputClass="h-12 rounded-xl border-2 border-gray-200 hover:border-[#FF4135] focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 w-full px-4 pr-12 font-iransans text-right bg-white transition-all duration-200 text-[#2D2D2D] placeholder:text-gray-400"
                            placeholder="انتخاب تاریخ"
                            style={{
                                width: "100%",
                                height: "48px"
                            }}
                        />
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        {localFilters[key] && (
                            <button
                                type="button"
                                onClick={() => handleClearIndividualFilter(key)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4135] transition-colors duration-200 z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            );
        } else {
            // English Gregorian date picker
            return (
                <div className="space-y-2">
                    <Label className="text-[#2D2D2D] font-medium flex items-center gap-2 font-poppins">
                        <Calendar className="w-4 h-4 text-[#FF4135]" />
                        {label}
                    </Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={value}
                            onChange={(e) => handleDateChange(key, e.target.value)}
                            className="h-12 rounded-xl border-2 border-gray-200 hover:border-[#FF4135] focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 pr-12 pl-4 font-poppins bg-white transition-all duration-200 text-[#2D2D2D]"
                        />
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                        {localFilters[key] && (
                            <button
                                type="button"
                                onClick={() => handleClearIndividualFilter(key)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4135] transition-colors duration-200 z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="mt-4">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-100 shadow-lg">
                <CardHeader>
                    <CardTitle className={cn(
                        "text-lg font-semibold text-[#2D2D2D] flex items-center gap-2",
                        isRTL ? "font-iransans" : "font-poppins"
                    )}>
                        <Filter className="w-5 h-5" />
                        {t("filterReports")}
                    </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6">
                    {/* Date Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {renderDatePicker("date_from", t("dateFrom"))}
                        {renderDatePicker("date_to", t("dateTo"))}
                    </div>

                    {/* Token Filter */}
                    <div className="space-y-2">
                        <Label className="text-[#2D2D2D] font-medium flex items-center gap-2">
                            <Tag className="w-4 h-4  text-[#FF4135]" />
                            {t("tokenFilter")}
                        </Label>
                        <div className="relative">
                            <Select
                                value={localFilters.token?.toString() || ""}
                                onValueChange={(value) => handleFilterChange("token", value)}
                                className="h-12 rounded-xl border-2 pr-10"
                            >
                                <option value="">{t("allTokens")}</option>
                                {tokenOptions?.map((token) => (
                                    <option key={token.id} value={token.id.toString()}>
                                        {token.token_name} ({token.token_symbol})
                                    </option>
                                ))}
                            </Select>
                            {localFilters.token && (
                                <button
                                    type="button"
                                    onClick={() => handleClearIndividualFilter("token")}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mine Filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Mine Name Filter */}
                        <div className="space-y-2">
                            <Label className={cn(
                                "text-[#2D2D2D] font-medium flex items-center gap-2",
                                isRTL ? "font-iransans" : "font-poppins"
                            )}>
                                <Mountain className="w-4 h-4 text-[#FF4135]" />
                                {t("mineNameFilter") || "Mine Name"}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    value={localFilters.mine_name || ""}
                                    onChange={(e) => handleFilterChange("mine_name", e.target.value)}
                                    placeholder={t("enterMineName") || "Enter mine name"}
                                    className={cn(
                                        "h-12 rounded-xl border-2 border-gray-200 hover:border-[#FF4135] focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 bg-white transition-all duration-200 text-[#2D2D2D]",
                                        isRTL ? "font-iransans pr-12 pl-4 text-right" : "font-poppins pl-12 pr-4"
                                    )}
                                />
                                <Mountain className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none",
                                    isRTL ? "right-3" : "left-3"
                                )} />
                                {localFilters.mine_name && (
                                    <button
                                        type="button"
                                        onClick={() => handleClearIndividualFilter("mine_name")}
                                        className={cn(
                                            "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4135] transition-colors duration-200 z-10",
                                            isRTL ? "left-3" : "right-3"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div className="space-y-2">
                            <Label className={cn(
                                "text-[#2D2D2D] font-medium flex items-center gap-2",
                                isRTL ? "font-iransans" : "font-poppins"
                            )}>
                                <MapPin className="w-4 h-4 text-[#FF4135]" />
                                {t("locationFilter") || "Location"}
                            </Label>
                            <div className="relative">
                                <Input
                                    type="text"
                                    list="iran-cities"
                                    value={localFilters.mine_location || ""}
                                    onChange={(e) => handleFilterChange("mine_location", e.target.value)}
                                    placeholder={t("enterOrSelectLocation") || "Enter or select location"}
                                    className={cn(
                                        "h-12 rounded-xl border-2 border-gray-200 hover:border-[#FF4135] focus:border-[#FF4135] focus:ring-2 focus:ring-[#FF4135]/20 bg-white transition-all duration-200 text-[#2D2D2D]",
                                        isRTL ? "font-iransans pr-12 pl-4 text-right" : "font-poppins pl-12 pr-4"
                                    )}
                                />
                                <datalist id="iran-cities">
                                    <option value="تهران" />
                                    <option value="اصفهان" />
                                    <option value="مشهد" />
                                    <option value="شیراز" />
                                    <option value="تبریز" />
                                    <option value="کرج" />
                                    <option value="اهواز" />
                                    <option value="قم" />
                                    <option value="کرمانشاه" />
                                    <option value="ارومیه" />
                                    <option value="رشت" />
                                    <option value="زاهدان" />
                                    <option value="کرمان" />
                                    <option value="همدان" />
                                    <option value="یزد" />
                                    <option value="اردبیل" />
                                    <option value="بندرعباس" />
                                    <option value="اراک" />
                                    <option value="قزوین" />
                                    <option value="خرم‌آباد" />
                                    <option value="سنندج" />
                                    <option value="بوشهر" />
                                    <option value="سمنان" />
                                    <option value="بیرجند" />
                                    <option value="گرگان" />
                                    <option value="ساری" />
                                    <option value="بابل" />
                                    <option value="آمل" />
                                    <option value="بجنورد" />
                                    <option value="یاسوج" />
                                    <option value="شهرکرد" />
                                </datalist>
                                <MapPin className={cn(
                                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none",
                                    isRTL ? "right-3" : "left-3"
                                )} />
                                {localFilters.mine_location && (
                                    <button
                                        type="button"
                                        onClick={() => handleClearIndividualFilter("mine_location")}
                                        className={cn(
                                            "absolute top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#FF4135] transition-colors duration-200 z-10",
                                            isRTL ? "left-3" : "right-3"
                                        )}
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClearFilters}
                            disabled={!hasActiveFilters}
                            className={cn(
                                "flex-1 h-12 rounded-xl border-2",
                                isRTL ? "font-iransans" : "font-poppins"
                            )}
                        >
                            <X className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("clearFilters")}
                        </Button>
                        <Button
                            type="button"
                            onClick={handleApplyFilters}
                            className={cn(
                                "flex-1 h-12 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-xl hover:scale-105 transition-all duration-200",
                                isRTL ? "font-iransans" : "font-poppins"
                            )}
                        >
                            <Filter className={cn("w-4 h-4", isRTL ? "ml-2" : "mr-2")} />
                            {t("applyFilters")}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
