import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Props = {
    otp: string;
    setOtp: (value: string) => void;
    onVerify: () => void;
    onClose: () => void;
    loading: boolean;
    error: string;
};

export default function OtpModal({
    otp,
    setOtp,
    onVerify,
    onClose,
    loading,
    error,
}: Props) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
            <div className="bg-white p-6 rounded-2xl w-[90%] max-w-sm space-y-4">
                <h2 className="text-xl font-semibold text-center">Verify Email</h2>

                <p className="text-sm text-gray-500 text-center">
                    Enter the OTP sent to your email
                </p>

                <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <Button onClick={onVerify} className="w-full" disabled={loading}>
                    {loading ? "Verifying..." : "Verify OTP"}
                </Button>

                <Button
                    onClick={onClose}
                    className="text-sm text-gray-400 w-full text-center"
                    variant="outline"
                >
                    Cancel
                </Button>
            </div>
        </div>
    );
}
