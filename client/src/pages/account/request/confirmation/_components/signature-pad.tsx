import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { SignatureIcon } from "@/components/icons";
import { forwardRef, useImperativeHandle, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";

export type SignaturePadHandle = {
  getDataURL: (type?: string) => string;
  isEmpty: () => boolean;
};

type SignaturePadProps = {
  /** Called when the signature content changes. `isEmpty` is true when the pad is empty. */
  onSignatureChange?: (isEmpty: boolean) => void;
};

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad({ onSignatureChange }, ref) {
    const canvasRef = useRef<SignatureCanvas>(null);

    useImperativeHandle(ref, () => ({
      getDataURL: (type = "image/png") =>
        canvasRef.current?.toDataURL(type) ?? "",
      isEmpty: () => canvasRef.current?.isEmpty() ?? true,
    }));

    const handleReset = () => {
      canvasRef.current?.clear();
      onSignatureChange?.(true);
    };

    const handleEnd = () => {
      const isEmpty = canvasRef.current?.isEmpty() ?? true;
      onSignatureChange?.(isEmpty);
    };

    return (
      <div className="relative flex h-[300px] w-full items-center justify-center rounded-xl border">
        <Empty className="absolute inset-0 z-10 opacity-20">
          <EmptyHeader>
            <EmptyMedia>
              <SignatureIcon className="size-12" />
            </EmptyMedia>
            <EmptyTitle>Use your mouse to sign</EmptyTitle>
          </EmptyHeader>
        </Empty>
        <SignatureCanvas
          ref={canvasRef}
          penColor="black"
          onEnd={handleEnd}
          canvasProps={{
            className: "w-full h-[300px] z-20",
          }}
        />
        <Button
          variant="outline"
          size="sm"
          className="absolute right-2 bottom-2 z-20"
          onClick={handleReset}
        >
          Clear
        </Button>
      </div>
    );
  },
);
