import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { incomeService } from "../../services/income";

export function useIncome() {
    const [searchParams] = useSearchParams();
    const from = searchParams.get("from") || undefined;
    const to = searchParams.get("to") || undefined;
    const page = searchParams.get("page") || 1;
    const perPage = searchParams.get("perPage") || 10;

    // const from = searchParams.get("from") || undefined;
    // const to = searchParams.get("to") || undefined;
    const query = useQuery({
        queryKey: ['income', { from, to, page, perPage }],
        queryFn: () => incomeService.get({
            queryParams: {
                from,
                to,
                page: page ? Number(page) : undefined,
                perPage: perPage ? Number(perPage) : undefined
            }
        })
    })
    return query
}