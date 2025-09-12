// Inspired by https://dribbble.com/shots/24322433-AI-Interface-elements

'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button, buttonVariants } from '@/components/ui/button';
import { Mic, Camera } from 'lucide-react';

const PromptInputWrapper = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'relative flex w-full items-center overflow-hidden rounded-full bg-background p-1.5 shadow-[0_0_0_1px_hsl(var(--primary)/0.2),0_1px_2px_0_hsl(var(--primary)/0.1)] transition-shadow focus-within:shadow-[0_0_0_1px_hsl(var(--primary)/0.4),0_0_12px_0_hsl(var(--primary)/0.2)]',
      className
    )}
    {...props}
  />
));
PromptInputWrapper.displayName = 'PromptInputWrapper';

const PromptInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<'input'>
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'flex h-10 w-full rounded-full border-none bg-transparent px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      className
    )}
    {...props}
   />
));
PromptInput.displayName = 'PromptInput';

const PromptInputActions = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('flex items-center', className)} {...props} />
));
PromptInputActions.displayName = 'PromptInputActions';

const PromptInputAction = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, ...props }, ref) => (
  <Button
    ref={ref}
    variant="ghost"
    size="icon"
    className={cn(
      'h-9 w-9 shrink-0 rounded-full text-muted-foreground hover:bg-primary/10 hover:text-primary',
      className
    )}
    {...props}
  />
));
PromptInputAction.displayName = 'PromptInputAction';

function PromptInputWithIcons({
  prompt,
  onPromptChange,
  onPromptSubmit,
  placeholder,
  isLoading,
}: {
  prompt: string;
  onPromptChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPromptSubmit: () => void;
  placeholder: string;
  isLoading?: boolean;
}) {
  return (
    <PromptInputWrapper>
      <PromptInput
        placeholder={placeholder}
        value={prompt}
        onChange={onPromptChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            onPromptSubmit();
          }
        }}
        disabled={isLoading}
      />
      <PromptInputActions>
        <PromptInputAction
          onClick={() => {
            /* Placeholder for mic input */
          }}
          disabled={isLoading}
        >
          <Mic />
        </PromptInputAction>
        <PromptInputAction
          onClick={() => {
            /* Placeholder for camera input */
          }}
          disabled={isLoading}
        >
          <Camera />
        </PromptInputAction>
        <Button
          onClick={onPromptSubmit}
          size="icon"
          className="h-9 w-9 shrink-0 rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/30"
          disabled={isLoading || !prompt.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5"
          >
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
          </svg>
        </Button>
      </PromptInputActions>
    </PromptInputWrapper>
  );
}

export {
  PromptInputWrapper,
  PromptInput,
  PromptInputActions,
  PromptInputAction,
  PromptInputWithIcons,
};
