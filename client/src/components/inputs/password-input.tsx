import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { useState } from 'react';

type PasswordInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type'
>;

const PasswordInput = ({
  className,
  disabled,
  ...props
}: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className={cn('relative rounded-md', className)}>
      <Input
        type={showPassword ? 'text' : 'password'}
        disabled={disabled}
        {...props}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        disabled={disabled}
        className="absolute right-1 top-1/2 size-7 -translate-y-1/2 rounded-md text-muted-foreground"
        onClick={() => setShowPassword((prev) => !prev)}
      >
        {showPassword ? <EyeIcon /> : <EyeOffIcon />}
      </Button>
    </div>
  );
};

export { PasswordInput };
