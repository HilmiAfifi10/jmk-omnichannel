'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';

interface DataTablePaginationProps {
	page: number;
	pageSize: number;
	total: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	onPageSizeChange: (pageSize: number) => void;
}

export function DataTablePagination({
	page,
	pageSize,
	total,
	totalPages,
	onPageChange,
	onPageSizeChange,
}: DataTablePaginationProps) {
	const startItem = (page - 1) * pageSize + 1;
	const endItem = Math.min(page * pageSize, total);

	return (
		<div className="flex items-center justify-between px-2 py-4">
			<div className="text-sm text-muted-foreground">
				Menampilkan {startItem}-{endItem} dari {total} data
			</div>
			<div className="flex items-center gap-4">
				<div className="flex items-center gap-2">
					<span className="text-sm text-muted-foreground">Per halaman</span>
					<Select
						value={pageSize.toString()}
						onValueChange={(value) => onPageSizeChange(Number(value))}
					>
						<SelectTrigger className="h-8 w-16">
							<SelectValue placeholder={pageSize.toString()} />
						</SelectTrigger>
						<SelectContent>
							{[10, 20, 30, 50].map((size) => (
								<SelectItem key={size} value={size.toString()}>
									{size}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
				<div className="flex items-center gap-1">
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => onPageChange(page - 1)}
						disabled={page <= 1}
					>
						<ChevronLeft className="h-4 w-4" />
					</Button>
					<span className="mx-2 text-sm">
						{page} / {totalPages}
					</span>
					<Button
						variant="outline"
						size="icon"
						className="h-8 w-8"
						onClick={() => onPageChange(page + 1)}
						disabled={page >= totalPages}
					>
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
