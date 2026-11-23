import HttpClient, { type RequestOptions } from "../client.js";
import type { ApiResponse } from "./auth.js";

export type ProductId = string | number;
export type ProductUploadFile =
  Blob | File | NodeJS.ReadableStream | string | unknown;
export type ProductComparisonOperator =
  "moreThan" | "lessThan" | "equals" | string;

export interface ProductIdentifierObject {
  productId?: ProductId;
  id?: ProductId;
  [key: string]: unknown;
}

export type ProductIdentifierInput = ProductId | ProductIdentifierObject;

export interface CreateProductPayload {
  businessId: string | number;
  productName: string;
  productDescription: string;
  productPrice: string | number;
  quantityType: string;
  quantityStock: number;
  isPhysical: boolean;
  [key: string]: unknown;
}

export interface GetProductsParams {
  status?: boolean | string;
  quantityType?: string;
  quantityStock?: number;
  quantityStockType?: ProductComparisonOperator;
  productPrice?: string | number;
  productPriceType?: ProductComparisonOperator;
  searchPlanText?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
  [key: string]: string | number | boolean | undefined | null;
}

export interface ProductStatusActionPayload {
  productId: ProductId;
  status: boolean;
  [key: string]: unknown;
}

export interface UpdateProductDetailsPayload {
  productId: ProductId;
  productName: string;
  productDescription: string;
  productPrice: string | number;
  quantityType: string;
  quantityStock: number;
  minOrder: number;
  maxOrder: number;
  lowStockAlert: boolean;
  notifyStock: number;
  shareableUrl: string;
  productBackgroundColor: string;
  deliveryAddress: string;
  deliveryNote: string;
  redirectAfterPaymentLink: string;
  successMessage: string;
  sendNotification: string;
  isActive: boolean;
  [key: string]: unknown;
}

export interface ProductFileUploadObjectPayload {
  productId: ProductId;
  media: ProductUploadFile;
  [key: string]: unknown;
}

export type ProductFileUploadInput = FormData | ProductFileUploadObjectPayload;

export interface DeleteProductMediaPayload {
  mediaId: string | number;
  status: boolean;
  [key: string]: unknown;
}

export interface RenameDigitalDownloadFilePayload {
  productId: ProductId;
  digitalDownloadFileId: string | number;
  fileName: string;
  [key: string]: unknown;
}

export interface DeleteDigitalDownloadFilePayload {
  productId: ProductId;
  digitalDownloadFileId: string | number;
  status: boolean;
  [key: string]: unknown;
}

export interface SetDownloadLinkExpiryPayload {
  productId: ProductId;
  isDownloadLinkExpiry: boolean;
  downloadLinkExpiryDuration: string;
  [key: string]: unknown;
}

export interface AddDeliveryFeesPayload {
  productId: ProductId;
  location: string;
  fees: string | number;
  [key: string]: unknown;
}

export interface UpdateDeliveryFeesPayload {
  productId: ProductId;
  deliveryFeesId: string | number;
  location: string;
  fees: string | number;
  [key: string]: unknown;
}

export interface DeleteDeliveryFeesPayload {
  productId: ProductId;
  deliveryFeesId: string | number;
  status: boolean;
  [key: string]: unknown;
}

export type SlugCheckInput =
  | string
  | {
      slug?: string;
      [key: string]: unknown;
    };

export interface AddDiscountCodePayload {
  productId?: number | string;
  code: string;
  value: number;
  discounttype: string;
  minOrderAmount?: number;
  maxUsePerCustomer?: number;
  maxClaims?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  isDelete?: boolean;
  [key: string]: unknown;
}

export interface GetDiscountCodesParams {
  productId?: ProductId;
  code?: string;
  [key: string]: string | number | undefined | null;
}

export interface UpdateDiscountCodeDetailsPayload {
  discountCodeId?: number | string;
  code?: string;
  value?: number;
  discounttype?: string;
  [key: string]: unknown;
}

export interface VerifyDiscountCodePayload {
  productId?: ProductId;
  code: string;
  [key: string]: unknown;
}

export interface ProductRecord {
  id?: ProductId;
  productId?: ProductId;
  businessId?: string | number;
  productName?: string;
  productDescription?: string;
  productPrice?: string | number;
  quantityType?: string;
  quantityStock?: number;
  isPhysical?: boolean;
  isActive?: boolean;
  [key: string]: unknown;
}

export interface ProductMediaRecord {
  id?: string | number;
  mediaId?: string | number;
  productId?: ProductId;
  url?: string;
  fileName?: string;
  status?: boolean;
  [key: string]: unknown;
}

export interface ProductInventoryRecord {
  productId?: ProductId;
  quantityType?: string;
  quantityStock?: number;
  minOrder?: number;
  maxOrder?: number;
  lowStockAlert?: boolean;
  notifyStock?: number;
  [key: string]: unknown;
}

export interface DeliveryFeeRecord {
  id?: string | number;
  deliveryFeesId?: string | number;
  productId?: ProductId;
  location?: string;
  fees?: string | number;
  status?: boolean;
  [key: string]: unknown;
}

export interface DiscountCodeRecord {
  id?: string | number;
  productId?: ProductId;
  code?: string;
  value?: number;
  discounttype?: string;
  isActive?: boolean;
  isDelete?: boolean;
  [key: string]: unknown;
}

export class Products {
  private readonly client: HttpClient;

  constructor(client: HttpClient) {
    this.client = client;
  }

  /**
   * Creates a new product.
   * POST /api/payment-service/external/v1/products/create-product
   */
  public async createProduct(
    payload: CreateProductPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    if (
      !payload ||
      payload.businessId === undefined ||
      payload.businessId === null ||
      !payload.productName ||
      !payload.productDescription ||
      payload.productPrice === undefined ||
      payload.productPrice === null ||
      !payload.quantityType ||
      payload.quantityStock === undefined ||
      payload.quantityStock === null ||
      payload.isPhysical === undefined ||
      payload.isPhysical === null
    ) {
      throw new Error(
        "Invalid payload: 'businessId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', and 'isPhysical' are required.",
      );
    }

    const requestPayload: CreateProductPayload = {
      businessId: payload.businessId,
      productName: payload.productName,
      productDescription: payload.productDescription,
      productPrice: payload.productPrice,
      quantityType: payload.quantityType,
      quantityStock: payload.quantityStock,
      isPhysical: payload.isPhysical,
    };

    return this.client.request<ApiResponse<ProductRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/create-product",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves a paginated list of products with optional filters.
   * GET /api/payment-service/external/v1/products/get-products
   */
  public async getProducts(
    params: GetProductsParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord[]>> {
    let endpoint = "/api/payment-service/external/v1/products/get-products";

    if (
      params &&
      typeof params === "object" &&
      Object.keys(params).length > 0
    ) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      }
      const queryString = searchParams.toString();
      if (queryString) {
        endpoint += `?${queryString}`;
      }
    }

    return this.client.request<ApiResponse<ProductRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Retrieves detailed information for a specific product.
   * GET /api/payment-service/external/v1/products/get-product-details
   */
  public async getProductDetails(
    identifier: ProductIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    let productId: ProductId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      productId =
        identifier.productId !== undefined
          ? identifier.productId
          : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve product details.",
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-details?${searchParams.toString()}`;

    return this.client.request<ApiResponse<ProductRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Deletes or updates the status of an existing product.
   * POST /api/payment-service/external/v1/products/delete-product
   */
  public async deleteProduct(
    payload: ProductStatusActionPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    if (
      !payload ||
      payload.productId === undefined ||
      payload.productId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error(
        "Invalid payload: 'productId' and 'status' are required.",
      );
    }

    const requestPayload: ProductStatusActionPayload = {
      productId: payload.productId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<ProductRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/delete-product",
      requestPayload,
      options,
    );
  }

  /**
   * Archives or unarchives an existing product.
   * POST /api/payment-service/external/v1/products/archive-product
   */
  public async archiveProduct(
    payload: ProductStatusActionPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    if (
      !payload ||
      payload.productId === undefined ||
      payload.productId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error(
        "Invalid payload: 'productId' and 'status' are required.",
      );
    }

    const requestPayload: ProductStatusActionPayload = {
      productId: payload.productId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<ProductRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/archive-product",
      requestPayload,
      options,
    );
  }

  /**
   * Updates detailed information for an existing product.
   * PUT /api/payment-service/external/v1/products/update-product-details
   */
  public async updateProductDetails(
    payload: UpdateProductDetailsPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    if (
      !payload ||
      !payload.productId ||
      !payload.productName ||
      !payload.productDescription ||
      payload.productPrice === undefined ||
      payload.productPrice === null ||
      !payload.quantityType ||
      payload.quantityStock === undefined ||
      payload.quantityStock === null ||
      payload.minOrder === undefined ||
      payload.minOrder === null ||
      payload.maxOrder === undefined ||
      payload.maxOrder === null ||
      payload.lowStockAlert === undefined ||
      payload.lowStockAlert === null ||
      payload.notifyStock === undefined ||
      payload.notifyStock === null ||
      !payload.shareableUrl ||
      !payload.productBackgroundColor ||
      !payload.deliveryAddress ||
      !payload.deliveryNote ||
      !payload.redirectAfterPaymentLink ||
      !payload.successMessage ||
      !payload.sendNotification ||
      payload.isActive === undefined ||
      payload.isActive === null
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'productName', 'productDescription', 'productPrice', 'quantityType', 'quantityStock', 'minOrder', 'maxOrder', 'lowStockAlert', 'notifyStock', 'shareableUrl', 'productBackgroundColor', 'deliveryAddress', 'deliveryNote', 'redirectAfterPaymentLink', 'successMessage', 'sendNotification', and 'isActive' are required.",
      );
    }

    const requestPayload: UpdateProductDetailsPayload = {
      productId: payload.productId,
      productName: payload.productName,
      productDescription: payload.productDescription,
      productPrice: payload.productPrice,
      quantityType: payload.quantityType,
      quantityStock: payload.quantityStock,
      minOrder: payload.minOrder,
      maxOrder: payload.maxOrder,
      lowStockAlert: payload.lowStockAlert,
      notifyStock: payload.notifyStock,
      shareableUrl: payload.shareableUrl,
      productBackgroundColor: payload.productBackgroundColor,
      deliveryAddress: payload.deliveryAddress,
      deliveryNote: payload.deliveryNote,
      redirectAfterPaymentLink: payload.redirectAfterPaymentLink,
      successMessage: payload.successMessage,
      sendNotification: payload.sendNotification,
      isActive: payload.isActive,
    };

    return this.client.request<ApiResponse<ProductRecord>>(
      "PUT",
      "/api/payment-service/external/v1/products/update-product-details",
      requestPayload,
      options,
    );
  }

  /**
   * Uploads a media file for a product using multipart/form-data.
   * POST /api/payment-service/external/v1/products/product-upload-media
   */
  public async productUploadMedia(
    payload: ProductFileUploadInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord>> {
    let requestBody: FormData | ProductFileUploadObjectPayload = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.productId === undefined ||
        payload.productId === null ||
        payload.media === undefined ||
        payload.media === null
      ) {
        throw new Error(
          "Invalid payload: 'productId' and 'media' are required.",
        );
      }

      const formData = new FormData();
      formData.append("productId", String(payload.productId));
      formData.append("media", payload.media as string | Blob);
      requestBody = formData;
    }

    return this.client.request<ApiResponse<ProductMediaRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/product-upload-media",
      requestBody,
      options,
    );
  }

  /**
   * Retrieves media associated with a specific product.
   * GET /api/payment-service/external/v1/products/get-product-media
   */
  public async getProductMedia(
    identifier: ProductIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord[]>> {
    let productId: ProductId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      productId =
        identifier.productId !== undefined
          ? identifier.productId
          : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve product media.",
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-media?${searchParams.toString()}`;

    return this.client.request<ApiResponse<ProductMediaRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Deletes or updates the status of an existing product media item.
   * POST /api/payment-service/external/v1/products/delete-product-media
   */
  public async deleteProductMedia(
    payload: DeleteProductMediaPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord>> {
    if (
      !payload ||
      payload.mediaId === undefined ||
      payload.mediaId === null ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error("Invalid payload: 'mediaId' and 'status' are required.");
    }

    const requestPayload: DeleteProductMediaPayload = {
      mediaId: payload.mediaId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<ProductMediaRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/delete-product-media",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves inventory details for a specific product.
   * GET /api/payment-service/external/v1/products/get-product-inventory-details
   */
  public async getProductInventoryDetails(
    identifier: ProductIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductInventoryRecord>> {
    let productId: ProductId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      productId =
        identifier.productId !== undefined
          ? identifier.productId
          : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve product inventory details.",
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-product-inventory-details?${searchParams.toString()}`;

    return this.client.request<ApiResponse<ProductInventoryRecord>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Uploads a file for digital download associated with a product using multipart/form-data.
   * POST /api/payment-service/external/v1/products/add-digital-download-files
   */
  public async addDigitalDownloadFiles(
    payload: ProductFileUploadInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord>> {
    let requestBody: FormData | ProductFileUploadObjectPayload = payload;

    if (!(payload instanceof FormData)) {
      if (
        !payload ||
        payload.productId === undefined ||
        payload.productId === null ||
        payload.media === undefined ||
        payload.media === null
      ) {
        throw new Error(
          "Invalid payload: 'productId' and 'media' are required.",
        );
      }

      const formData = new FormData();
      formData.append("productId", String(payload.productId));
      formData.append("media", payload.media as string | Blob);
      requestBody = formData;
    }

    return this.client.request<ApiResponse<ProductMediaRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/add-digital-download-files",
      requestBody,
      options,
    );
  }

  /**
   * Retrieves digital download files associated with a specific product.
   * GET /api/payment-service/external/v1/products/get-digital-download-files
   */
  public async getDigitalDownloadFiles(
    identifier: ProductIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord[]>> {
    let productId: ProductId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      productId =
        identifier.productId !== undefined
          ? identifier.productId
          : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve digital download files.",
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-digital-download-files?${searchParams.toString()}`;

    return this.client.request<ApiResponse<ProductMediaRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Renames an existing digital download file associated with a product.
   * PUT /api/payment-service/external/v1/products/rename-digital-download-files
   */
  public async renameDigitalDownloadFiles(
    payload: RenameDigitalDownloadFilePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord>> {
    if (
      !payload ||
      !payload.productId ||
      !payload.digitalDownloadFileId ||
      !payload.fileName
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'digitalDownloadFileId', and 'fileName' are required.",
      );
    }

    const requestPayload: RenameDigitalDownloadFilePayload = {
      productId: payload.productId,
      digitalDownloadFileId: payload.digitalDownloadFileId,
      fileName: payload.fileName,
    };

    return this.client.request<ApiResponse<ProductMediaRecord>>(
      "PUT",
      "/api/payment-service/external/v1/products/rename-digital-download-files",
      requestPayload,
      options,
    );
  }

  /**
   * Deletes or updates the status of an existing digital download file.
   * POST /api/payment-service/external/v1/products/delete-digital-download-files
   */
  public async deleteDigitalDownloadFiles(
    payload: DeleteDigitalDownloadFilePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductMediaRecord>> {
    if (
      !payload ||
      !payload.productId ||
      !payload.digitalDownloadFileId ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'digitalDownloadFileId', and 'status' are required.",
      );
    }

    const requestPayload: DeleteDigitalDownloadFilePayload = {
      productId: payload.productId,
      digitalDownloadFileId: payload.digitalDownloadFileId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<ProductMediaRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/delete-digital-download-files",
      requestPayload,
      options,
    );
  }

  /**
   * Sets the download link expiry configuration for a product.
   * PUT /api/payment-service/external/v1/products/set-download-link-expiry
   */
  public async setDownloadLinkExpiry(
    payload: SetDownloadLinkExpiryPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<ProductRecord>> {
    if (
      !payload ||
      !payload.productId ||
      payload.isDownloadLinkExpiry === undefined ||
      payload.isDownloadLinkExpiry === null ||
      !payload.downloadLinkExpiryDuration
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'isDownloadLinkExpiry', and 'downloadLinkExpiryDuration' are required.",
      );
    }

    const requestPayload: SetDownloadLinkExpiryPayload = {
      productId: payload.productId,
      isDownloadLinkExpiry: payload.isDownloadLinkExpiry,
      downloadLinkExpiryDuration: payload.downloadLinkExpiryDuration,
    };

    return this.client.request<ApiResponse<ProductRecord>>(
      "PUT",
      "/api/payment-service/external/v1/products/set-download-link-expiry",
      requestPayload,
      options,
    );
  }

  /**
   * Adds delivery fees for a specific location to a product.
   * POST /api/payment-service/external/v1/products/add-delivery-fees
   */
  public async addDeliveryFees(
    payload: AddDeliveryFeesPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DeliveryFeeRecord>> {
    if (!payload || !payload.productId || !payload.location || !payload.fees) {
      throw new Error(
        "Invalid payload: 'productId', 'location', and 'fees' are required.",
      );
    }

    const requestPayload: AddDeliveryFeesPayload = {
      productId: payload.productId,
      location: payload.location,
      fees: payload.fees,
    };

    return this.client.request<ApiResponse<DeliveryFeeRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/add-delivery-fees",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves delivery fees for a specific product.
   * GET /api/payment-service/external/v1/products/get-delivery-fees
   */
  public async getDeliveryFees(
    identifier: ProductIdentifierInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DeliveryFeeRecord[]>> {
    let productId: ProductId | undefined;

    if (identifier !== null && typeof identifier === "object") {
      productId =
        identifier.productId !== undefined
          ? identifier.productId
          : identifier.id;
    } else {
      productId = identifier;
    }

    if (productId === undefined || productId === null || productId === "") {
      throw new Error(
        "Invalid parameter: 'productId' is required to retrieve delivery fees.",
      );
    }

    const searchParams = new URLSearchParams({ productId: String(productId) });
    const endpoint = `/api/payment-service/external/v1/products/get-delivery-fees?${searchParams.toString()}`;

    return this.client.request<ApiResponse<DeliveryFeeRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates an existing delivery fee record for a product.
   * PUT /api/payment-service/external/v1/products/update-delivery-fees
   */
  public async updateDeliveryFees(
    payload: UpdateDeliveryFeesPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DeliveryFeeRecord>> {
    if (
      !payload ||
      !payload.productId ||
      !payload.deliveryFeesId ||
      !payload.location ||
      !payload.fees
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'deliveryFeesId', 'location', and 'fees' are required.",
      );
    }

    const requestPayload: UpdateDeliveryFeesPayload = {
      productId: payload.productId,
      deliveryFeesId: payload.deliveryFeesId,
      location: payload.location,
      fees: payload.fees,
    };

    return this.client.request<ApiResponse<DeliveryFeeRecord>>(
      "PUT",
      "/api/payment-service/external/v1/products/update-delivery-fees",
      requestPayload,
      options,
    );
  }

  /**
   * Deletes or updates the status of an existing delivery fee record.
   * POST /api/payment-service/external/v1/products/delete-delivery-fees
   */
  public async deleteDeliveryFees(
    payload: DeleteDeliveryFeesPayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DeliveryFeeRecord>> {
    if (
      !payload ||
      !payload.productId ||
      !payload.deliveryFeesId ||
      payload.status === undefined ||
      payload.status === null
    ) {
      throw new Error(
        "Invalid payload: 'productId', 'deliveryFeesId', and 'status' are required.",
      );
    }

    const requestPayload: DeleteDeliveryFeesPayload = {
      productId: payload.productId,
      deliveryFeesId: payload.deliveryFeesId,
      status: payload.status,
    };

    return this.client.request<ApiResponse<DeliveryFeeRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/delete-delivery-fees",
      requestPayload,
      options,
    );
  }

  /**
   * Checks whether a product slug already exists.
   * POST /api/payment-service/external/v1/products/slugExist
   */
  public async slugExist(
    payload: SlugCheckInput,
    options: RequestOptions = {},
  ): Promise<ApiResponse<Record<string, unknown>>> {
    let slug: string | undefined;

    if (payload !== null && typeof payload === "object") {
      slug = payload.slug;
    } else {
      slug = payload;
    }

    if (slug === undefined || slug === null || slug === "") {
      throw new Error("Invalid payload: 'slug' is required.");
    }

    const requestPayload = {
      slug: String(slug),
    };

    return this.client.request<ApiResponse<Record<string, unknown>>>(
      "POST",
      "/api/payment-service/external/v1/products/slugExist",
      requestPayload,
      options,
    );
  }

  /**
   * Creates a new discount code.
   * POST /api/payment-service/external/v1/products/add-discount-code
   */
  public async addDiscountCode(
    payload: AddDiscountCodePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DiscountCodeRecord>> {
    if (
      !payload ||
      !payload.code ||
      payload.value === undefined ||
      payload.value === null ||
      !payload.discounttype
    ) {
      throw new Error(
        "Invalid payload: 'code', 'value', and 'discounttype' are required.",
      );
    }

    const requestPayload: AddDiscountCodePayload = {
      ...(payload.productId !== undefined && { productId: payload.productId }),
      code: payload.code,
      value: payload.value,
      discounttype: payload.discounttype,
      ...(payload.minOrderAmount !== undefined && {
        minOrderAmount: payload.minOrderAmount,
      }),
      ...(payload.maxUsePerCustomer !== undefined && {
        maxUsePerCustomer: payload.maxUsePerCustomer,
      }),
      ...(payload.maxClaims !== undefined && { maxClaims: payload.maxClaims }),
      ...(payload.startDate !== undefined && { startDate: payload.startDate }),
      ...(payload.endDate !== undefined && { endDate: payload.endDate }),
      ...(payload.isActive !== undefined && { isActive: payload.isActive }),
      ...(payload.isDelete !== undefined && { isDelete: payload.isDelete }),
    };

    return this.client.request<ApiResponse<DiscountCodeRecord>>(
      "POST",
      "/api/payment-service/external/v1/products/add-discount-code",
      requestPayload,
      options,
    );
  }

  /**
   * Retrieves discount codes based on optional query parameters like productId or code.
   * GET /api/payment-service/external/v1/products/get-discount-codes
   */
  public async getDiscountCodes(
    params: GetDiscountCodesParams = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<DiscountCodeRecord[]>> {
    const queryParams =
      params !== null && typeof params === "object" ? params : {};

    const searchParams = new URLSearchParams();
    if (
      queryParams.productId !== undefined &&
      queryParams.productId !== null &&
      queryParams.productId !== ""
    ) {
      searchParams.append("productId", String(queryParams.productId));
    }
    if (
      queryParams.code !== undefined &&
      queryParams.code !== null &&
      queryParams.code !== ""
    ) {
      searchParams.append("code", String(queryParams.code));
    }

    const queryString = searchParams.toString();
    const endpoint = `/api/payment-service/external/v1/products/get-discount-codes${queryString ? `?${queryString}` : ""}`;

    return this.client.request<ApiResponse<DiscountCodeRecord[]>>(
      "GET",
      endpoint,
      null,
      options,
    );
  }

  /**
   * Updates discount code details.
   * PUT /api/payment-service/external/v1/products/update-discount-code-details
   */
  public async updateDiscountCodeDetails(
    payload: UpdateDiscountCodeDetailsPayload = {},
    options: RequestOptions = {},
  ): Promise<ApiResponse<DiscountCodeRecord>> {
    const requestPayload =
      payload !== null && typeof payload === "object" ? payload : {};

    return this.client.request<ApiResponse<DiscountCodeRecord>>(
      "PUT",
      "/api/payment-service/external/v1/products/update-discount-code-details",
      requestPayload,
      options,
    );
  }

  /**
   * Verifies a discount code, with an optional product ID query parameter.
   * POST /api/payment-service/external/v1/products/verify-discount-code
   */
  public async verifyDiscountCode(
    payload: VerifyDiscountCodePayload,
    options: RequestOptions = {},
  ): Promise<ApiResponse<DiscountCodeRecord>> {
    if (!payload || !payload.code) {
      throw new Error("Invalid payload: 'code' is required.");
    }

    const queryParams = new URLSearchParams();
    if (
      payload.productId !== undefined &&
      payload.productId !== null &&
      payload.productId !== ""
    ) {
      queryParams.append("productId", String(payload.productId));
    }

    const queryString = queryParams.toString();
    const endpoint = `/api/payment-service/external/v1/products/verify-discount-code${queryString ? `?${queryString}` : ""}`;

    const requestPayload = {
      code: payload.code,
    };

    return this.client.request<ApiResponse<DiscountCodeRecord>>(
      "POST",
      endpoint,
      requestPayload,
      options,
    );
  }
}

export default Products;
