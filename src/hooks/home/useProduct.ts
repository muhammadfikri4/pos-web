import { ApiErrorResponse, ApiResponse } from "@core/libs/api/types";
import useDebounce from "@hooks/global/useDebounce";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { productService } from "../../services/products";

interface Options {
  page?: number;
  perPage?: number;
  categoryId?: string;
  search?: string;
}

type PayloadType = 'create' | 'update' | 'delete'

interface ProductCreation {
  type: PayloadType
  data?: FormData
  id?: string
}

export function useProduct(options?: Options) {
  const [searchParams] = useSearchParams();
  const categoryId =
    options?.categoryId || searchParams.get("categoryId") || undefined;
  const page = options?.page || searchParams.get("page") || 1;
  const perPage = options?.perPage || searchParams.get("perPage") || 10;
  const searchQuery =
    options?.search || searchParams.get("search") || undefined;
  const search = useDebounce(searchQuery as string, 500);

  const query = useQuery({
    queryKey: ["products", { categoryId, perPage, page, search }],
    queryFn: () =>
      productService.get({
        queryParams: {
          categoryId,
          name: search,
          page: page ? Number(page) : undefined,
          perPage: perPage ? Number(perPage) : undefined,
        },
      }),
  });
  return query;
}

export function useProductCreation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate()
  const { refetch } = useProduct()

  const mutation = useMutation({
    mutationFn: async ({ data, type, id }: ProductCreation) => {
      switch (type) {
        case 'create':
          return productService.post(data, { contentType: "form-data" })
        case 'update':
          return productService.put(data, { contentType: "form-data", path: id })
        case 'delete':
          return productService.delete({ path: id })
        default:
          return productService.post(data, { contentType: "form-data" })
      }
    },
    onSuccess: (res) => {
      alert(res.message),
        navigate("/admin/product")
      refetch()
      return queryClient.removeQueries({ queryKey: ["products"] })
    },

    onError: (err: ApiErrorResponse<ApiResponse>) => {
      alert(err.response?.data.message)

    }
  })
  return mutation
}

export function useProductById() {
  const { id } = useParams()
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => productService.getById({ path: id }),
    enabled: !!id,
  });
}
