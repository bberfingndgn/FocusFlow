'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Mail, RefreshCw, CheckCircle2 } from 'lucide-react';

interface ParentPinModalProps {
  isOpen: boolean;
  parentEmail: string;
  subject: string;
  durationMinutes: number;
  isSendingOtp: boolean;
  onVerify: (code: string) => Promise<boolean>;
  onResend: () => Promise<void>;
  onClose: () => void;
}

export function ParentPinModal({
  isOpen,
  parentEmail,
  subject,
  durationMinutes,
  isSendingOtp,
  onVerify,
  onResend,
  onClose,
}: ParentPinModalProps) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [attempts, setAttempts] = useState(0);

  const maskedEmail = parentEmail.replace(/(.{2})(.*)(@.*)/, '$1***$3');

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter the 6-digit code.');
      return;
    }
    setVerifying(true);
    setError('');

    const ok = await onVerify(code);

    if (ok) {
      setCode('');
      setAttempts(0);
    } else {
      const next = attempts + 1;
      setAttempts(next);
      setError(
        next >= 5
          ? 'Too many incorrect attempts. Please request a new code.'
          : `Incorrect code. ${5 - next} attempt(s) remaining.`
      );
      setCode('');
    }
    setVerifying(false);
  };

  const handleResend = async () => {
    setError('');
    setAttempts(0);
    setCode('');
    await onResend();
  };

  const handleClose = () => {
    setCode('');
    setError('');
    setAttempts(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="h-6 w-6 text-primary" />
            Parent Verification Required
          </DialogTitle>
          <DialogDescription>
            Your child completed a <strong>{durationMinutes}-minute</strong>{' '}
            <strong>{subject}</strong> session.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Bilgi kartı */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
              Session saved — waiting for parent approval
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary shrink-0" />
              {isSendingOtp ? (
                <span>Sending code to <strong>{maskedEmail}</strong>...</span>
              ) : (
                <span>
                  A 6-digit code was sent to <strong>{maskedEmail}</strong>
                </span>
              )}
            </div>
          </div>

          {/* OTP girişi */}
          <div className="space-y-2">
            <Label htmlFor="otp-code">Verification Code</Label>
            <Input
              id="otp-code"
              type="text"
              inputMode="numeric"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                setError('');
                setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
              }}
              onKeyDown={(e) => e.key === 'Enter' && !verifying && attempts < 5 && handleVerify()}
              className="text-center text-3xl tracking-[0.6em] font-mono"
              maxLength={6}
              disabled={verifying || attempts >= 5}
            />
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
          </div>

          {/* Kodu tekrar gönder */}
          <button
            type="button"
            onClick={handleResend}
            disabled={isSendingOtp}
            className="w-full flex items-center justify-center gap-2 text-sm text-primary hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-3 w-3 ${isSendingOtp ? 'animate-spin' : ''}`} />
            {isSendingOtp ? 'Sending...' : 'Resend code'}
          </button>

          {/* Butonlar */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleClose}>
              Skip for now
            </Button>
            <Button
              className="flex-1"
              onClick={handleVerify}
              disabled={code.length !== 6 || verifying || attempts >= 5}
            >
              {verifying ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Verify
            </Button>
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Skipping saves the session, but flower growth won&apos;t unlock until a parent verifies.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
