import { useIsMobile } from "@/hooks/use-mobile";
import { SearchIcon } from "@/components/icons";
import { useCallback, useEffect, useState } from "react";
import { debounce } from "throttle-debounce";
import { openRequest } from "@/stores/use-open-requests-store";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandList,
} from "@/components/ui/command";
import { searchRequests } from "@/domains/requests/request.api";
import type {
  SearchData,
  SearchResponseData,
} from "@/domains/requests/request.types";
import { cn } from "@/lib/utils";

const DEBOUNCE_DELAY = 500;
const SHORTCUT_KEY = "k";

interface SearchResultItemProps {
  item: SearchResponseData;
  onSelect: () => void;
  className?: string;
}

const SearchResultItem = ({
  item,
  onSelect,
  className,
}: SearchResultItemProps) => (
  <button
    className={cn(
      "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 w-full cursor-pointer px-4 py-2 text-left text-sm transition-all",
      className,
    )}
    onClick={onSelect}
  >
    {Object.keys(item.data).map((key) => {
      const value = item.data[key as keyof SearchData];
      const highlightedValue = item.highlighting[key as keyof SearchData];

      console.log("highlightedValue", highlightedValue);
      console.log("value", value);
      return (
        <div
          key={key}
          className="grid grid-cols-[7rem_1fr] items-center leading-6"
        >
          <span className="text-muted-foreground capitalize">
            {key.replace("_", " ")}:
          </span>
          {highlightedValue ? (
            <span
              dangerouslySetInnerHTML={{
                __html: highlightedValue,
              }}
            />
          ) : (
            <span>{value}</span>
          )}
        </div>
      );
    })}
  </button>
);

export function GlobalSearch() {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<SearchResponseData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const result = await searchRequests(query);
      // console.log("result", result);
      setResults(result);
      setError(null);
    } catch (error) {
      console.error(error);
      setResults([]);
      setError("Failed to fetch search results");
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debouncedSearch = useCallback(
    debounce(DEBOUNCE_DELAY, handleSearch, { atBegin: false }),
    [handleSearch],
  );

  const handleInputChange = (search: string) => {
    setIsSearching(true);
    setSearchTerm(search);
    debouncedSearch(search);
  };

  const handleResultSelect = (itemId: number) => {
    setOpen(false);
    openRequest(itemId);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === SHORTCUT_KEY && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant="outline"
        size={isMobile ? "icon" : "default"}
      >
        <SearchIcon />
        <span className="hidden md:block">Search anything...</span>
        <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-0.5 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none md:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>
      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            placeholder="Search anything"
            value={searchTerm}
            onValueChange={handleInputChange}
            isLoading={isSearching}
          />
          <CommandList className="max-h-[470px] p-0">
            {error && <CommandEmpty>{error}</CommandEmpty>}
            {!error && results.length < 1 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}
            <div className="divide-y last:rounded-b-md">
              {results.map((item, index) => (
                <SearchResultItem
                  key={`${item.data.id}-${index}`}
                  item={item}
                  onSelect={() => handleResultSelect(item.data.id)}
                  className={cn(index === results.length - 1 && "rounded-b-lg")}
                />
              ))}
            </div>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
