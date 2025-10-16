import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
import { formatDistanceToNow, format } from "date-fns";
import { enUS, faIR } from "date-fns/locale";
import {
    ArrowLeft,
    ArrowRight,
    MessageCircle,
    Paperclip,
    Send,
    User,
    Clock,
    CheckCircle,
    XCircle as CloseIcon,
    RefreshCw,
    Ticket,
    AlertCircle,
    Upload,
    FileText,
    Trash2,
    Info,
    CheckCheck,
    Wallet,
    LogIn
} from "lucide-react";
import {
    useTicketDetails,
    useTicketComments,
    useTicketAttachments,
    useAddComment,
    useUploadAttachment,
    useCloseTicket
} from "@/lib/api";
import { toast } from "react-hot-toast";
import { useRouter } from "@/i18n/navigation";
import useAuthStore from "@/stores/useAuthStore";
import { formatDateByLocale } from "@/lib/date";

const STATUS_COLORS = {
    OPEN: "bg-blue-100 text-blue-800 border-blue-200",
    IN_PROGRESS: "bg-orange-100 text-orange-800 border-orange-200",
    PENDING: "bg-purple-100 text-purple-800 border-purple-200",
    RESOLVED: "bg-green-100 text-green-800 border-green-200",
    CLOSED: "bg-gray-100 text-gray-800 border-gray-200"
};

const PRIORITY_COLORS = {
    LOW: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HIGH: "bg-orange-100 text-orange-800",
    CRITICAL: "bg-red-100 text-red-800"
};

const STATUS_ICONS = {
    OPEN: Clock,
    IN_PROGRESS: RefreshCw,
    PENDING: AlertCircle,
    RESOLVED: CheckCircle,
    CLOSED: CloseIcon
};

export default function TicketDetailsPage({ ticketId }) {
    const [newComment, setNewComment] = useState('');
    const [showCloseConfirm, setShowCloseConfirm] = useState(false);
    const [showMobileInfo, setShowMobileInfo] = useState(false);
    const [replyFiles, setReplyFiles] = useState([]);
    const messagesEndRef = useRef(null);

    const t = useTranslations("support");
    const locale = useLocale();
    const isRTL = locale === "fa";
    const dateLocale = locale === "fa" ? faIR : enUS;
    const router = useRouter();
    const { isAuthenticated, authMethod } = useAuthStore();

    const hasAuthToken = typeof window !== "undefined" && !!localStorage.getItem('auth_token');
    const hasSSOAuth = isAuthenticated && authMethod === 'sso' && hasAuthToken;

    const {
        data: ticketDetails,
        isLoading: detailsLoading,
        error: detailsError,
        refetch: refetchDetails
    } = useTicketDetails(ticketId, {
        enabled: !!ticketId && hasSSOAuth
    });

    const {
        data: commentsData,
        isLoading: commentsLoading,
        refetch: refetchComments
    } = useTicketComments(ticketId, {
        enabled: !!ticketId && hasSSOAuth
    });

    const {
        data: attachmentsData,
        isLoading: attachmentsLoading,
        refetch: refetchAttachments
    } = useTicketAttachments(ticketId, {
        enabled: !!ticketId && hasSSOAuth
    });

    const comments = commentsData?.results || [];
    const attachments = attachmentsData?.results || [];

    const addCommentMutation = useAddComment({
        onSuccess: async () => {
            if (replyFiles.length > 0) {
                await uploadReplyAttachments();
            }

            setNewComment('');
            setReplyFiles([]);
            refetchComments();
            refetchAttachments();
            refetchDetails();
            toast.success(t("messageAdded"));
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        },
        onError: () => {
            toast.error(t("messageError"));
        }
    });

    const uploadAttachmentMutation = useUploadAttachment();

    const uploadReplyAttachments = async () => {
        for (const file of replyFiles) {
            try {
                const formData = new FormData();
                formData.append('file', file.file);
                if (file.description) {
                    formData.append('description', file.description);
                }

                await uploadAttachmentMutation.mutateAsync({ ticketId, formData });
            } catch (error) {
                console.error(`Error uploading file ${file.file.name}:`, error);
                toast.error(t("fileUploadError", { fileName: file.file.name }));
            }
        }
    };

    useEffect(() => {
        if (comments && comments.length > 0) {
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }, [comments]);

    const closeTicketMutation = useCloseTicket({
        onSuccess: () => {
            setShowCloseConfirm(false);
            refetchDetails();
            toast.success(t("ticketClosed"));
        },
        onError: () => {
            toast.error(t("closeTicketError"));
        }
    });

    const handleReplyFileSelect = (event) => {
        const files = Array.from(event.target.files);
        const maxSize = 150 * 1024 * 1024;
        const allowedTypes = [
            'image/jpeg', 'image/png', 'image/gif', 'image/webp',
            'application/pdf', 'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain', 'application/zip', 'application/x-zip-compressed'
        ];

        const validFiles = files.filter(file => {
            if (file.size > maxSize) {
                toast.error(t("fileTooLarge", { fileName: file.name }));
                return false;
            }
            if (!allowedTypes.includes(file.type)) {
                toast.error(t("fileTypeNotAllowed", { fileName: file.name }));
                return false;
            }
            return true;
        });

        const newFiles = validFiles.map(file => ({
            id: Math.random().toString(36).substr(2, 9),
            file,
            description: ''
        }));

        setReplyFiles(prev => [...prev, ...newFiles]);
        event.target.value = '';
    };

    const removeReplyFile = (fileId) => {
        setReplyFiles(prev => prev.filter(f => f.id !== fileId));
    };

    const updateReplyFileDescription = (fileId, description) => {
        setReplyFiles(prev => prev.map(f =>
            f.id === fileId ? { ...f, description } : f
        ));
    };

    const handleAddComment = (e) => {
        e.preventDefault();
        if (!newComment.trim() && replyFiles.length === 0) return;

        addCommentMutation.mutate({
            ticketId,
            content: newComment.trim() || "File attachment"
        });
    };

    const handleCloseTicket = () => {
        closeTicketMutation.mutate({
            ticketId
        });
    };

    const handleBack = () => {
        router.push('/dashboard/support');
    };

    // Show SSO required message for wallet-only users
    if (isAuthenticated && authMethod === 'wallet') {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wallet className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("ssoRequired")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {t("ssoRequiredDesc")}
                    </p>
                    <button
                        onClick={() => window.location.href = `/${locale}/auth/login`}
                        className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                        <LogIn className="w-4 h-4" />
                        {t("loginWithSSO")}
                    </button>
                </div>
            </div>
        );
    }

    // Show authentication required message if no authentication at all
    if (!hasSSOAuth) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Ticket className="w-8 h-8 text-orange-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("authRequired")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {t("authRequiredDesc")}
                    </p>
                    <button
                        onClick={() => window.location.href = `/${locale}/auth/login`}
                        className="bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center gap-2 mx-auto"
                    >
                        <LogIn className="w-4 h-4" />
                        {t("loginNow")}
                    </button>
                </div>
            </div>
        );
    }

    if (detailsLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="flex-1">
                        <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="space-y-4">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="h-20 bg-gray-200 rounded animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div className="bg-white rounded-xl p-6 border border-gray-200">
                            <div className="h-40 bg-gray-200 rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (detailsError || !ticketDetails) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CloseIcon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t("errorTitle")}
                    </h3>
                    <p className="text-gray-600 mb-4">
                        {t("ticketNotFound")}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <button
                            onClick={handleBack}
                            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            {t("backToTickets")}
                        </button>
                        <button
                            onClick={() => refetchDetails()}
                            className="px-4 py-2 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-lg hover:shadow-lg"
                        >
                            {t("tryAgain")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const canClose = ['OPEN', 'IN_PROGRESS', 'PENDING'].includes(ticketDetails.status);
    const StatusIcon = STATUS_ICONS[ticketDetails.status];

    return (
        <div className="bg-gray-50 flex flex-col min-h-screen overflow-x-hidden -mx-4 sm:-mx-6 -my-6">
            {/* Responsive Header */}
            <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 lg:gap-4">
                        <button
                            onClick={handleBack}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            {isRTL ? (
                                <ArrowRight className="w-5 h-5" />
                            ) : (
                                <ArrowLeft className="w-5 h-5" />
                            )}
                        </button>
                        <div>
                            <h1 className="text-sm lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Ticket className="w-4 h-4 lg:w-6 lg:h-6 text-orange-500" />
                                {ticketDetails.ticket_id}
                            </h1>
                            <p className="text-gray-600 text-xs lg:text-sm truncate max-w-[150px] lg:max-w-none">
                                {ticketDetails.title}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Mobile info button only */}
                        <button
                            onClick={() => setShowMobileInfo(!showMobileInfo)}
                            className="lg:hidden p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <Info className="w-4 h-4" />
                        </button>

                        {/* Desktop status badges */}
                        <div className="hidden lg:flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[ticketDetails.status]}`}>
                                <StatusIcon className="w-4 h-4 mr-2" />
                                {t(`status.${ticketDetails.status.toLowerCase()}`)}
                            </span>
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${PRIORITY_COLORS[ticketDetails.priority]}`}>
                                {t(`priority.${ticketDetails.priority.toLowerCase()}`)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>


            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Mobile: Full Screen Chat, Desktop: Split Layout */}
                <div className="flex-1 flex flex-col lg:flex-row min-h-0">
                    {/* Chat Area - Full width on mobile */}
                    <div className="flex-1 flex flex-col min-h-0">
                        {/* Conversation Header */}
                        <div className="flex-shrink-0 bg-white border-b border-gray-200 px-4 lg:px-6 py-3 lg:py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MessageCircle className="w-4 h-4 lg:w-5 lg:h-5 text-gray-400" />
                                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base">{t("conversation")}</h3>
                                    <span className="text-xs lg:text-sm text-gray-500">({comments.length})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    {/* Mobile Info Button */}
                                    <button
                                        onClick={() => refetchComments()}
                                        className="p-1.5 lg:p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Chat Messages - Scrollable area */}
                        <div className="flex-1 px-4 py-6 bg-gray-50 overflow-y-auto min-h-0">
                            <div className="space-y-4">
                                {commentsLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="animate-pulse">
                                                <div className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                                                    <div className="max-w-xs lg:max-w-md px-4 py-2 rounded-2xl bg-gray-200">
                                                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-1"></div>
                                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : comments.length === 0 ? (
                                    <div className="text-center py-12">
                                        <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                        <p className="text-gray-500 text-lg">{t("noMessages")}</p>
                                        <p className="text-gray-400 text-sm mt-2">{t("startConversation")}</p>
                                    </div>
                                ) : (
                                    comments.map((comment) => {
                                        const isStaff = comment.is_staff_reply;
                                        const isUser = !isStaff;

                                        const userPosition = isRTL ? 'justify-start' : 'justify-end';
                                        const staffPosition = isRTL ? 'justify-end' : 'justify-start';
                                        const userFlexDirection = isRTL ? 'flex-row' : 'flex-row-reverse';
                                        const staffFlexDirection = isRTL ? 'flex-row-reverse' : 'flex-row';

                                        return (
                                            <div key={comment.id} className={`flex ${isUser ? userPosition : staffPosition} mb-6`}>
                                                {/* Clean message layout inspired by the images */}
                                                <div className={`flex gap-3 max-w-[75%]  ${isUser ? userFlexDirection : staffFlexDirection}`}>
                                                    {/* Cleaner avatar */}
                                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isStaff
                                                        ? 'bg-blue-500'
                                                        : 'bg-orange-500'
                                                        }`}>
                                                        {isStaff ? (
                                                            <span className="text-white text-xs font-bold">
                                                                {comment.author?.display_name?.charAt(0) || 'S'}
                                                            </span>
                                                        ) : (
                                                            <User className="w-4 h-4 text-white" />
                                                        )}
                                                    </div>

                                                    <div className="flex flex-col flex-1">
                                                        {/* Author and time - cleaner positioning */}
                                                        <div className={`flex items-center gap-2 mb-2 ${isUser ? 'justify-start' : 'justify-end'}`}>
                                                            <span className="text-xs font-medium text-gray-600">
                                                                {isStaff ? (comment.author?.display_name || 'Support') : 'You'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {formatDistanceToNow(new Date(comment.created_at), {
                                                                    addSuffix: true,
                                                                    locale: dateLocale
                                                                })}
                                                            </span>
                                                        </div>

                                                        {/* Message bubble - cleaner design like the images */}
                                                        <div className={`px-4 py-3 rounded-2xl shadow-sm ${isUser
                                                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white ml-auto rounded-br-md'
                                                            : 'bg-white border border-gray-200 text-gray-900 mr-auto rounded-bl-md'
                                                            }`}>
                                                            <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                                                {comment.content}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}

                            </div>
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Chat Input - Clean design like the images */}
                        {ticketDetails.status !== 'CLOSED' && (
                            <div className="flex-shrink-0 bg-white border-t border-gray-200 px-4 py-4">
                                {replyFiles.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <p className="text-sm font-medium text-gray-700">{t("replyAttachmentsLabel")}</p>
                                        {replyFiles.map((fileItem) => (
                                            <div key={fileItem.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">
                                                        {fileItem.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(fileItem.file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeReplyFile(fileItem.id)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                    disabled={addCommentMutation.isPending}
                                                >
                                                    <Trash2 className="w-3 h-3 text-red-500" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <form onSubmit={handleAddComment}>
                                    <div className="relative">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleReplyFileSelect}
                                            className="hidden"
                                            id="reply-file-upload"
                                            disabled={addCommentMutation.isPending}
                                        />
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder={t("addMessagePlaceholder")}
                                            rows={1}
                                            className={`w-full px-3 py-2 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none min-h-[40px] lg:min-h-[48px] max-h-32 text-sm lg:text-base ${isRTL ? 'pl-20 pr-3' : 'pr-20 pl-3'}`}
                                            disabled={addCommentMutation.isPending}
                                            style={{
                                                height: 'auto',
                                                minHeight: window.innerWidth >= 1024 ? '48px' : '40px'
                                            }}
                                            onInput={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if ((newComment.trim() || replyFiles.length > 0) && !addCommentMutation.isPending) {
                                                        handleAddComment(e);
                                                    }
                                                }
                                            }}
                                        />

                                        {/* File attachment button */}
                                        <label
                                            htmlFor="reply-file-upload"
                                            className={`absolute top-2 ${isRTL ? 'left-12' : 'right-12'} p-1.5 text-gray-400 hover:text-orange-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer`}
                                        >
                                            <Paperclip className="w-4 h-4" />
                                        </label>

                                        {/* Send button */}
                                        <button
                                            type="submit"
                                            disabled={(!newComment.trim() && replyFiles.length === 0) || addCommentMutation.isPending}
                                            className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded-full hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center`}
                                        >
                                            {addCommentMutation.isPending ? (
                                                <RefreshCw className="w-3 h-3 lg:w-4 lg:h-4 animate-spin" />
                                            ) : (
                                                <Send className="w-3 h-3 lg:w-4 lg:h-4" />
                                            )}
                                        </button>
                                    </div>

                                    <p className="text-xs text-gray-500 mt-1 px-1 hidden sm:block">
                                        {t("inputHelp")}
                                    </p>
                                </form>
                            </div>
                        )}

                        {/* Mobile Close Ticket - Below input */}
                        {canClose && (
                            <div className="lg:hidden bg-gray-50 border-t border-gray-200 px-4 py-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-4">
                                        {t("ticketResolved")}
                                    </p>
                                    {!showCloseConfirm ? (
                                        <button
                                            onClick={() => setShowCloseConfirm(true)}
                                            className="w-full flex items-center justify-center gap-3 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium text-base shadow-lg"
                                        >
                                            <CheckCheck className="w-5 h-5" />
                                            {t("closeTicket")}
                                        </button>
                                    ) : (
                                        <div className="space-y-3">
                                            <p className="text-center text-sm text-gray-700">{t("closeConfirm")}</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setShowCloseConfirm(false)}
                                                    className="py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 font-medium"
                                                >
                                                    {t("cancel")}
                                                </button>
                                                <button
                                                    onClick={handleCloseTicket}
                                                    disabled={closeTicketMutation.isPending}
                                                    className="py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
                                                >
                                                    <CheckCheck className="w-4 h-4" />
                                                    {closeTicketMutation.isPending ? t("closing") : t("confirm")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block w-80 border-l border-gray-200 bg-white">
                        <div className="p-6 space-y-6">
                            {/* Attachments - Top Priority */}
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                        <h3 className="font-semibold text-gray-900">{t("attachments")}</h3>
                                        <span className="text-sm text-gray-500">({attachments.length})</span>
                                    </div>
                                    <button
                                        onClick={() => refetchAttachments()}
                                        className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
                                    >
                                        <RefreshCw className="w-3 h-3" />
                                    </button>
                                </div>

                                <div className="space-y-2">
                                    {attachmentsLoading ? (
                                        <div className="space-y-2">
                                            {[...Array(2)].map((_, i) => (
                                                <div key={i} className="animate-pulse">
                                                    <div className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg">
                                                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                                                        <div className="flex-1">
                                                            <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                                            <div className="h-2 bg-gray-200 rounded w-1/2"></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : attachments.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">{t("noAttachments")}</p>
                                        </div>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg hover:border-orange-300 transition-colors">
                                                <div className="w-8 h-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                    <Paperclip className="w-4 h-4 text-gray-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate text-xs">
                                                        {attachment.file_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <a
                                                    href={attachment.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-2 py-1 text-xs bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded hover:shadow-lg transition-all duration-200"
                                                >
                                                    {t("download")}
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Essential Info Only */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm lg:text-base">{t("description")}</h3>
                                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-xs lg:text-sm">
                                        {ticketDetails.description}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 lg:grid-cols-1 gap-3 lg:gap-4">
                                <div>
                                    <p className="text-gray-500 mb-1 text-xs">{t("created")}</p>
                                    <p className="font-medium text-xs lg:text-sm">
                                        {formatDateByLocale(ticketDetails.created_at, locale, "datetime")}
                                    </p>
                                </div>
                                {ticketDetails.category && (
                                    <div>
                                        <p className="text-gray-500 mb-1 text-xs">{t("category")}</p>
                                        <p className="font-medium flex items-center gap-1 text-xs lg:text-sm">
                                            {ticketDetails.category?.icon && (
                                                <span>{ticketDetails.category.icon}</span>
                                            )}
                                            {t(`categories.${ticketDetails.category?.name}`) || ticketDetails.category?.name}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Close Ticket Action */}
                            {canClose && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-3">{t("ticketActions")}</h3>
                                    {!showCloseConfirm ? (
                                        <button
                                            onClick={() => setShowCloseConfirm(true)}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition-colors font-medium"
                                        >
                                            <CheckCheck className="w-5 h-5" />
                                            {t("closeTicket")}
                                        </button>
                                    ) : (
                                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                            <p className="text-sm text-green-800 mb-4">{t("closeConfirm")}</p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => setShowCloseConfirm(false)}
                                                    className="flex-1 px-3 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                                >
                                                    {t("cancel")}
                                                </button>
                                                <button
                                                    onClick={handleCloseTicket}
                                                    disabled={closeTicketMutation.isPending}
                                                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCheck className="w-4 h-4" />
                                                    {closeTicketMutation.isPending ? t("closing") : t("confirm")}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Info Modal */}
            {showMobileInfo && (
                <div className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end">
                    <div className="bg-white w-full max-h-[80vh] rounded-t-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-900">{t("ticketInfo")}</h2>
                            <button
                                onClick={() => setShowMobileInfo(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <CloseIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="overflow-y-auto p-4 space-y-4">
                            {/* Attachments */}
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <Paperclip className="w-4 h-4 text-gray-400" />
                                        <h3 className="font-semibold text-gray-900">{t("attachments")}</h3>
                                        <span className="text-sm text-gray-500">({attachments.length})</span>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {attachments.length === 0 ? (
                                        <div className="text-center py-6">
                                            <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                                            <p className="text-gray-500 text-sm">{t("noAttachments")}</p>
                                        </div>
                                    ) : (
                                        attachments.map((attachment) => (
                                            <div key={attachment.id} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                                                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded flex items-center justify-center flex-shrink-0">
                                                    <Paperclip className="w-5 h-5 text-gray-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-gray-900 truncate text-sm">
                                                        {attachment.file_name}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">
                                                        {(attachment.file_size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                                <a
                                                    href={attachment.file_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-3 py-1 text-sm bg-gradient-to-r from-[#FF5D1B] to-[#FF363E] text-white rounded hover:shadow-lg transition-all duration-200"
                                                >
                                                    {t("download")}
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <h3 className="font-semibold text-gray-900 mb-3">{t("description")}</h3>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-sm">
                                        {ticketDetails.description}
                                    </p>
                                </div>
                            </div>

                            {/* Quick Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-gray-500 mb-1 text-xs">{t("created")}</p>
                                    <p className="font-medium text-sm">
                                        {formatDateByLocale(ticketDetails.created_at, locale, "datetime")}
                                    </p>
                                </div>
                                {ticketDetails.category && (
                                    <div>
                                        <p className="text-gray-500 mb-1 text-xs">{t("category")}</p>
                                        <p className="font-medium flex items-center gap-1 text-sm">
                                            {ticketDetails.category?.icon && (
                                                <span>{ticketDetails.category.icon}</span>
                                            )}
                                            {t(`categories.${ticketDetails.category?.name}`) || ticketDetails.category?.name}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Confirmation Modal */}
            {showCloseConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {t("closeTicket")}
                            </h3>
                            <p className="text-gray-600 mb-6">
                                {t("closeConfirm")}
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowCloseConfirm(false)}
                                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    {t("cancel")}
                                </button>
                                <button
                                    onClick={handleCloseTicket}
                                    disabled={closeTicketMutation.isPending}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                >
                                    <CheckCheck className="w-4 h-4" />
                                    {closeTicketMutation.isPending ? t("closing") : t("confirm")}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}