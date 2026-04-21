import { Loader2 } from "lucide-react";

interface LoadingProps {
    message?: string;
}

export const Loading = ({ message }: LoadingProps) => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                {message && <p className="text-sm text-gray-400">{message}</p>}
            </div>
        </div>
    );
}