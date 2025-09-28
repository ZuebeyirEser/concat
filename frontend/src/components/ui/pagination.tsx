import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/utils"
import { Button, type ButtonProps } from "@/components/ui/button"

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
    <nav
        role="navigation"
        aria-label="pagination"
        className={cn("mx-auto flex w-full justify-center", className)}
        {...props}
    />
)
Pagination.displayName = "Pagination"

const PaginationContent = React.forwardRef<
    HTMLUListElement,
    React.ComponentProps<"ul">
>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        className={cn("flex flex-row items-center gap-1", className)}
        {...props}
    />
))
PaginationContent.displayName = "PaginationContent"

const PaginationItem = React.forwardRef<
    HTMLLIElement,
    React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
    <li ref={ref} className={cn("", className)} {...props} />
))
PaginationItem.displayName = "PaginationItem"

type PaginationLinkProps = {
    isActive?: boolean
} & Pick<ButtonProps, "size"> &
    React.ComponentProps<"a">

const PaginationLink = ({
    className,
    isActive,
    size = "icon",
    onClick,
    ...props
}: PaginationLinkProps & { onClick?: () => void }) => (
    <button
        type="button"
        aria-current={isActive ? "page" : undefined}
        className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            isActive
                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                : "hover:bg-accent hover:text-accent-foreground",
            size === "default" && "h-10 px-4 py-2",
            size === "sm" && "h-9 rounded-md px-3",
            size === "lg" && "h-11 rounded-md px-8",
            size === "icon" && "h-10 w-10",
            className
        )}
        onClick={onClick}
        {...props}
    />
)
PaginationLink.displayName = "PaginationLink"

const PaginationPrevious = ({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof PaginationLink> & { onClick?: () => void }) => (
    <PaginationLink
        aria-label="Go to previous page"
        size="default"
        className={cn("gap-1 pl-2.5 cursor-pointer", className)}
        onClick={onClick}
        {...props}
    >
        <ChevronLeft className="h-4 w-4" />
        <span>Previous</span>
    </PaginationLink>
)
PaginationPrevious.displayName = "PaginationPrevious"

const PaginationNext = ({
    className,
    onClick,
    ...props
}: React.ComponentProps<typeof PaginationLink> & { onClick?: () => void }) => (
    <PaginationLink
        aria-label="Go to next page"
        size="default"
        className={cn("gap-1 pr-2.5 cursor-pointer", className)}
        onClick={onClick}
        {...props}
    >
        <span>Next</span>
        <ChevronRight className="h-4 w-4" />
    </PaginationLink>
)
PaginationNext.displayName = "PaginationNext"

const PaginationEllipsis = ({
    className,
    ...props
}: React.ComponentProps<"span">) => (
    <span
        aria-hidden
        className={cn("flex h-9 w-9 items-center justify-center", className)}
        {...props}
    >
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">More pages</span>
    </span>
)
PaginationEllipsis.displayName = "PaginationEllipsis"

// Chakra UI compatibility component
interface PaginationRootProps {
    count: number
    pageSize: number
    onPageChange: ({ page }: { page: number }) => void
    children: React.ReactNode
}

const PaginationRoot = ({ count, pageSize, onPageChange, children }: PaginationRootProps) => {
    const [currentPage, setCurrentPage] = React.useState(1)
    const totalPages = Math.ceil(count / pageSize)

    const handlePageChange = (page: number) => {
        setCurrentPage(page)
        onPageChange({ page })
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1)
        }
    }

    const handleNext = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1)
        }
    }

    return (
        <Pagination>
            <PaginationContent>
                <PaginationPrevious
                    onClick={handlePrevious}
                    className={currentPage <= 1 ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                />
                <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const page = i + 1
                        return (
                            <PaginationItem key={page}>
                                <PaginationLink
                                    isActive={page === currentPage}
                                    onClick={() => handlePageChange(page)}
                                    className="cursor-pointer"
                                >
                                    {page}
                                </PaginationLink>
                            </PaginationItem>
                        )
                    })}
                </div>
                <PaginationNext
                    onClick={handleNext}
                    className={currentPage >= totalPages ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}
                />
            </PaginationContent>
        </Pagination>
    )
}

// Chakra UI compatibility aliases
const PaginationItems = ({ className, ...props }: React.ComponentProps<"div">) => (
    <div className={cn("flex items-center gap-1", className)} {...props} />
)
const PaginationPrevTrigger = ({ onClick, disabled, ...props }: { onClick?: () => void; disabled?: boolean } & React.ComponentProps<typeof PaginationPrevious>) => (
    <PaginationPrevious
        {...props}
        onClick={onClick}
        className={cn(disabled && "opacity-50 cursor-not-allowed", props.className)}
    />
)
const PaginationNextTrigger = ({ onClick, disabled, ...props }: { onClick?: () => void; disabled?: boolean } & React.ComponentProps<typeof PaginationNext>) => (
    <PaginationNext
        {...props}
        onClick={onClick}
        className={cn(disabled && "opacity-50 cursor-not-allowed", props.className)}
    />
)

export {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
    // Chakra UI compatibility exports
    PaginationRoot,
    PaginationItems,
    PaginationPrevTrigger,
    PaginationNextTrigger,
}