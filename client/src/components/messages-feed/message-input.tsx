import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import { Textarea } from "@/components/ui/textarea";
import { SendIcon } from "@/components/icons";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isSending: boolean;
}

export function MessageInput({
  value,
  onChange,
  onSend,
  isSending,
}: MessageInputProps) {
  return (
    <div className="shrink-0 border-t px-4 py-3">
      <div className="flex items-start gap-2">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type a message..."
          rows={5}
          className="min-h-16"
        />
        <Button
          onClick={onSend}
          disabled={!value.trim() || isSending}
          size="icon"
        >
          <LoadingSwap isLoading={isSending}>
            <SendIcon />
          </LoadingSwap>
        </Button>
      </div>
    </div>
  );
}
