"use strict";
exports.__esModule = true;
var swagger_jsdoc_1 = require("swagger-jsdoc");
//import { version } from '../../';
var options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'PardoMart Node API',
            version: '1.0.0',
            description: 'API documentation for the PardoMart Node.js application.',
            contact: {
                name: 'PardoMart Support',
                url: 'https://pardomart.com',
                email: 'support@pardomart.com'
            }
        },
        servers: [
            {
                url: 'http://localhost:5000/api/v1',
                description: 'Local server'
            },
            {
                url: 'https://pardomart-node-api-vaje.onrender.com/api/v1',
                description: 'Development server'
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter JWT token'
                }
            },
            schemas: {
                // Base models used in search results
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        barcode: { type: 'string', nullable: true },
                        imageUrl: { type: 'string', format: 'uri', nullable: true }
                    }
                },
                Vendor: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        latitude: { type: 'number', format: 'float' },
                        longitude: { type: 'number', format: 'float' },
                        distance: { type: 'number', format: 'float', description: 'Distance in kilometers from the user.' },
                        rating: {
                            type: 'object',
                            properties: {
                                average: { type: 'number', format: 'float', description: 'The average rating score, from 1 to 5.' },
                                count: { type: 'integer', description: 'The total number of ratings.' }
                            },
                            description: 'Aggregate rating for the vendor.',
                            nullable: true
                        }
                    }
                },
                // --- Product Schemas ---
                ProductWithRelations: {
                    allOf: [
                        { $ref: '#/components/schemas/Product' },
                        {
                            type: 'object',
                            properties: {
                                categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                                tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } }
                            }
                        },
                    ]
                },
                VendorProductWithRelations: {
                    allOf: [
                        { $ref: '#/components/schemas/VendorProduct' },
                        {
                            type: 'object',
                            properties: {
                                product: { $ref: '#/components/schemas/Product' },
                                categories: { type: 'array', items: { $ref: '#/components/schemas/Category' } },
                                tags: { type: 'array', items: { $ref: '#/components/schemas/Tag' } }
                            }
                        },
                    ]
                },
                CreateProductPayload: {
                    type: 'object',
                    required: ['barcode', 'name', 'categoryIds'],
                    properties: {
                        barcode: { type: 'string', example: '1234567890123' },
                        name: { type: 'string', example: 'Generic Product Name' },
                        description: { type: 'string', nullable: true },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        attributes: { type: 'object', additionalProperties: true },
                        meta: { type: 'object', additionalProperties: true },
                        categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                        tagIds: { type: 'array', items: { type: 'string', format: 'uuid' }, nullable: true }
                    }
                },
                CreateVendorProductPayload: {
                    type: 'object',
                    required: ['vendorId', 'productId', 'price', 'name', 'categoryIds'],
                    properties: {
                        vendorId: { type: 'string', format: 'uuid' },
                        productId: { type: 'string', format: 'uuid' },
                        price: { type: 'number', format: 'float' },
                        discountedPrice: { type: 'number', format: 'float', nullable: true },
                        sku: { type: 'string', nullable: true },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        stock: { type: 'integer', nullable: true },
                        isAvailable: { type: 'boolean', "default": true },
                        attributes: { type: 'object', additionalProperties: true },
                        name: { type: 'string', example: 'Vendor-Specific Product Name' },
                        description: { type: 'string', nullable: true },
                        categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                        tagIds: { type: 'array', items: { type: 'string', format: 'uuid' }, nullable: true }
                    }
                },
                CreateVendorProductWithBarcodePayload: {
                    type: 'object',
                    required: ['vendorId', 'barcode', 'price', 'name', 'categoryIds'],
                    properties: {
                        vendorId: { type: 'string', format: 'uuid' },
                        barcode: { type: 'string', example: '1234567890123' },
                        price: { type: 'number', format: 'float' },
                        name: { type: 'string', example: 'Product Scanned by Barcode' },
                        description: { type: 'string', nullable: true },
                        categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                        discountedPrice: { type: 'number', format: 'float', nullable: true },
                        sku: { type: 'string', nullable: true },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        stock: { type: 'integer', nullable: true },
                        isAvailable: { type: 'boolean', "default": true },
                        attributes: { type: 'object', additionalProperties: true },
                        tagIds: { type: 'array', items: { type: 'string', format: 'uuid' }, nullable: true }
                    }
                },
                UpdateVendorProductPayload: {
                    type: 'object',
                    properties: {
                        price: { type: 'number', format: 'float' },
                        discountedPrice: { type: 'number', format: 'float', nullable: true },
                        sku: { type: 'string', nullable: true },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        stock: { type: 'integer', nullable: true },
                        isAvailable: { type: 'boolean' },
                        attributes: { type: 'object', additionalProperties: true },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                        tagIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                    }
                },
                UpdateProductBasePayload: {
                    type: 'object',
                    properties: {
                        barcode: { type: 'string' },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        images: { type: 'array', items: { type: 'string', format: 'uri' } },
                        attributes: { type: 'object', additionalProperties: true },
                        meta: { type: 'object', additionalProperties: true },
                        categoryIds: { type: 'array', items: { type: 'string', format: 'uuid' } },
                        tagIds: { type: 'array', items: { type: 'string', format: 'uuid' } }
                    }
                },
                // Search Result Schemas
                GeneralSearchResult: {
                    type: 'object',
                    properties: {
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Product' }
                        },
                        vendors: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Vendor' }
                        },
                        categories: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Category' }
                        }
                    }
                },
                VendorCategoryWithProducts: {
                    type: 'object',
                    properties: {
                        category: { $ref: '#/components/schemas/Category' },
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/VendorProduct' }
                        }
                    }
                },
                CategoriesWithProductsResult: {
                    type: 'object',
                    properties: {
                        parentCategories: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Category' }
                        },
                        subCategories: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/VendorCategoryWithProducts' }
                        }
                    }
                },
                StoreWithLimitedProducts: {
                    type: 'object',
                    properties: {
                        store: { $ref: '#/components/schemas/Vendor' },
                        products: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/VendorProduct' }
                        },
                        totalProducts: {
                            type: 'integer',
                            description: 'The total number of products found in the store that match the search criteria.'
                        }
                    }
                },
                CategoryDetailsResult: {
                    type: 'object',
                    properties: {
                        category: { $ref: '#/components/schemas/Category' },
                        stores: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/StoreWithLimitedProducts' }
                        }
                    }
                },
                StoresByProductResult: {
                    type: 'object',
                    properties: {
                        stores: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/StoreWithLimitedProducts' }
                        }
                    }
                },
                InitiateLogin: {
                    type: 'object',
                    properties: {
                        mobileNumber: {
                            type: 'string',
                            example: '+1234567890'
                        },
                        role: {
                            type: 'string',
                            "enum": ['CUSTOMER', 'VENDOR_ADMIN', 'SHOPPER_STAFF'],
                            example: 'CUSTOMER'
                        }
                    },
                    required: ['mobileNumber', 'role']
                },
                Fee: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        type: { type: 'string', "enum": ['DELIVERY', 'SERVICE', 'SHOPPING'] },
                        amount: { type: 'number', format: 'float' },
                        description: { type: 'string', nullable: true },
                        isActive: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateFeePayload: {
                    type: 'object',
                    properties: {
                        type: { type: 'string', "enum": ['DELIVERY', 'SERVICE', 'SHOPPING'], example: 'SERVICE' },
                        amount: { type: 'number', format: 'float', example: 5.99 },
                        description: { type: 'string', nullable: true, example: 'Standard service fee' },
                        isActive: { type: 'boolean', example: true }
                    },
                    required: ['type', 'amount']
                },
                UpdateFeePayload: {
                    type: 'object',
                    properties: {
                        amount: { type: 'number', format: 'float', example: 6.5 },
                        description: { type: 'string', nullable: true, example: 'Updated service fee' },
                        isActive: { type: 'boolean', example: false }
                    }
                },
                CalculateFeesPayload: {
                    type: 'object',
                    properties: {
                        orderItems: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    vendorProductId: { type: 'string', format: 'uuid' },
                                    quantity: { type: 'integer' }
                                },
                                required: ['vendorProductId', 'quantity']
                            },
                            example: [{ vendorProductId: 'uuid-goes-here', quantity: 2 }]
                        },
                        vendorId: { type: 'string', format: 'uuid' },
                        deliveryAddressId: { type: 'string', format: 'uuid' }
                    },
                    required: ['orderItems', 'vendorId', 'deliveryAddressId']
                },
                CalculateFeesResponse: {
                    type: 'object',
                    properties: {
                        subtotal: { type: 'number', format: 'float' },
                        shoppingFee: { type: 'number', format: 'float' },
                        deliveryFee: { type: 'number', format: 'float' },
                        serviceFee: { type: 'number', format: 'float' },
                        totalEstimatedCost: { type: 'number', format: 'float' }
                    }
                },
                DeliveryAddress: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        addressLine1: { type: 'string' },
                        addressLine2: { type: 'string', nullable: true },
                        city: { type: 'string' },
                        state: { type: 'string', nullable: true },
                        postalCode: { type: 'string', nullable: true },
                        country: { type: 'string' },
                        isDefault: { type: 'boolean' },
                        latitude: { type: 'number', format: 'float', nullable: true },
                        longitude: { type: 'number', format: 'float', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateDeliveryAddressPayload: {
                    type: 'object',
                    properties: {
                        addressLine1: { type: 'string', example: '123 Main St' },
                        addressLine2: { type: 'string', nullable: true, example: 'Apt 4B' },
                        city: { type: 'string', example: 'Anytown' },
                        state: { type: 'string', nullable: true, example: 'CA' },
                        postalCode: { type: 'string', nullable: true, example: '12345' },
                        country: { type: 'string', example: 'USA' },
                        isDefault: { type: 'boolean', example: false },
                        latitude: { type: 'number', format: 'float', nullable: true, example: 34.0522 },
                        longitude: { type: 'number', format: 'float', nullable: true, example: -118.2437 }
                    },
                    required: ['addressLine1', 'city', 'country']
                },
                UpdateDeliveryAddressPayload: {
                    type: 'object',
                    properties: {
                        addressLine1: { type: 'string', example: '123 Main St' },
                        addressLine2: { type: 'string', nullable: true, example: 'Apt 4B' },
                        city: { type: 'string', example: 'Anytown' },
                        state: { type: 'string', nullable: true, example: 'CA' },
                        postalCode: { type: 'string', nullable: true, example: '12345' },
                        country: { type: 'string', example: 'USA' },
                        isDefault: { type: 'boolean', example: false },
                        latitude: { type: 'number', format: 'float', nullable: true },
                        longitude: { type: 'number', format: 'float', nullable: true }
                    }
                },
                Category: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        description: { type: 'string', nullable: true },
                        parentId: { type: 'string', format: 'uuid', nullable: true },
                        type: { type: 'string', "enum": ['PRODUCT', 'SERVICE'] },
                        imageUrl: { type: 'string', format: 'uri', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                CreateCategoryPayload: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Electronics' },
                        parentId: { type: 'string', format: 'uuid', nullable: true, description: 'The ID of the parent category, if this is a sub-category.' },
                        type: { type: 'string', "enum": ['PRODUCT', 'SERVICE'], example: 'PRODUCT' },
                        imageUrl: { type: 'string', format: 'uri', nullable: true, example: 'https://example.com/images/electronics.png' }
                    },
                    required: ['name', 'type']
                },
                CreateCategoriesBulkPayload: {
                    type: 'object',
                    properties: {
                        categories: {
                            type: 'array',
                            items: {
                                $ref: '#/components/schemas/CreateCategoryPayload'
                            }
                        }
                    },
                    required: ['categories']
                },
                UpdateCategoryPayload: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', example: 'Consumer Electronics' },
                        parentId: { type: 'string', format: 'uuid', nullable: true },
                        type: { type: 'string', "enum": ['PRODUCT', 'SERVICE'] },
                        imageUrl: { type: 'string', format: 'uri', nullable: true }
                    }
                },
                UpdateCartItemPayload: {
                    type: 'object',
                    properties: {
                        quantity: {
                            type: 'integer',
                            description: 'The new quantity for the cart item.',
                            example: 2
                        }
                    }
                },
                PaymentMethods: {
                    type: 'string',
                    "enum": ['card', 'cash']
                },
                ShoppingMethod: {
                    type: 'string',
                    "enum": ['vendor', 'customer']
                },
                DeliveryMethod: {
                    type: 'string',
                    "enum": ['delivery_person', 'customer_pickup']
                },
                OrderStatus: {
                    type: 'string',
                    "enum": [
                        'pending', 'accepted_for_shopping', 'declined_by_vendor', 'currently_shopping',
                        'ready_for_pickup', 'ready_for_delivery', 'out_for_delivery', 'delivered',
                        'picked_up_by_customer', 'cancelled_by_customer', 'completed'
                    ]
                },
                OrderItemPayload: {
                    type: 'object',
                    required: ['vendorProductId', 'quantity'],
                    properties: {
                        vendorProductId: { type: 'string', format: 'uuid', example: 'clwz8b0a1000108l90u6y9f7f' },
                        quantity: { type: 'integer', minimum: 1, example: 2 }
                    }
                },
                CreateOrderPayload: {
                    type: 'object',
                    required: ['vendorId', 'paymentMethod', 'orderItems', 'shoppingMethod', 'deliveryMethod'],
                    properties: {
                        vendorId: { type: 'string', format: 'uuid' },
                        paymentMethod: { $ref: '#/components/schemas/PaymentMethods' },
                        shippingAddressId: { type: 'string', format: 'uuid', nullable: true, description: "ID of an existing delivery address. Required if newShippingAddress is not provided for a delivery order." },
                        newShippingAddress: { $ref: '#/components/schemas/CreateDeliveryAddressPayload', description: "A new delivery address object. Required if shippingAddressId is not provided for a delivery order." },
                        deliveryInstructions: { type: 'string', nullable: true, example: "Leave at the front door." },
                        orderItems: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/OrderItemPayload' }
                        },
                        shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' },
                        deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
                        scheduledShoppingStartTime: { type: 'string', format: 'date-time', nullable: true, description: "Optional. The UTC time when shopping should begin. Must be within vendor's operating hours." }
                    }
                },
                UpdateOrderStatusPayload: {
                    type: 'object',
                    required: ['status'],
                    properties: {
                        status: { $ref: '#/components/schemas/OrderStatus' }
                    }
                },
                UpdateOrderPayload: {
                    type: 'object',
                    properties: {
                        totalAmount: { type: 'number', format: 'float' },
                        deliveryFee: { type: 'number', format: 'float' },
                        serviceFee: { type: 'number', format: 'float' },
                        shoppingFee: { type: 'number', format: 'float' },
                        paymentMethod: { $ref: '#/components/schemas/PaymentMethods' },
                        paymentStatus: { type: 'string', "enum": ['pending', 'paid', 'failed'] },
                        orderStatus: { $ref: '#/components/schemas/OrderStatus' },
                        deliveryAddressId: { type: 'string', format: 'uuid' },
                        deliveryInstructions: { type: 'string' },
                        shoppingHandlerId: { type: 'string', format: 'uuid' },
                        deliveryPersonId: { type: 'string', format: 'uuid' },
                        shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' },
                        deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
                        scheduledShoppingStartTime: { type: 'string', format: 'date-time' }
                    }
                },
                DeclineOrderPayload: {
                    type: 'object',
                    properties: {
                        reason: { type: 'string', description: 'Reason for declining the order.' }
                    }
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        vendorId: { type: 'string', format: 'uuid' },
                        totalAmount: { type: 'number', format: 'float' },
                        deliveryFee: { type: 'number', format: 'float', nullable: true },
                        serviceFee: { type: 'number', format: 'float', nullable: true },
                        shoppingFee: { type: 'number', format: 'float', nullable: true },
                        paymentMethod: { $ref: '#/components/schemas/PaymentMethods' },
                        paymentStatus: { type: 'string', "enum": ['pending', 'paid', 'failed'] },
                        orderStatus: { $ref: '#/components/schemas/OrderStatus' },
                        deliveryAddressId: { type: 'string', format: 'uuid', nullable: true },
                        deliveryInstructions: { type: 'string', nullable: true },
                        shoppingMethod: { $ref: '#/components/schemas/ShoppingMethod' },
                        deliveryMethod: { $ref: '#/components/schemas/DeliveryMethod' },
                        scheduledShoppingStartTime: { type: 'string', format: 'date-time', nullable: true },
                        shoppingHandlerId: { type: 'string', format: 'uuid', nullable: true },
                        deliveryPersonId: { type: 'string', format: 'uuid', nullable: true },
                        reasonForDecline: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        orderItems: { type: 'array', items: { $ref: '#/components/schemas/CartItem' } },
                        user: { $ref: '#/components/schemas/User' },
                        vendor: { $ref: '#/components/schemas/Vendor' },
                        deliveryAddress: { $ref: '#/components/schemas/DeliveryAddress' },
                        shopper: { $ref: '#/components/schemas/User' },
                        deliverer: { $ref: '#/components/schemas/User' }
                    }
                },
                VendorProduct: {
                    type: 'object',
                    // A full definition would be better, but this is a good start.
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        price: { type: 'number', format: 'float' }
                    }
                },
                CartItem: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        cartId: { type: 'string', format: 'uuid', nullable: true },
                        vendorProductId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        orderId: { type: 'string', format: 'uuid', nullable: true },
                        vendorProduct: {
                            $ref: '#/components/schemas/VendorProduct'
                        }
                    }
                },
                Tag: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' }
                    }
                },
                CreateTagPayload: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'Special Offer' }
                    }
                },
                CreateTagsBulkPayload: {
                    type: 'object',
                    required: ['names'],
                    properties: {
                        names: {
                            type: 'array',
                            items: { type: 'string' },
                            example: ['New Arrival', 'Bestseller']
                        }
                    }
                },
                UpdateTagPayload: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: {
                            type: 'string', example: 'Clearance'
                        }
                    }
                },
                Cart: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        userId: { type: 'string', format: 'uuid' },
                        vendorId: { type: 'string', format: 'uuid' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                        cartItems: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/CartItem' }
                        },
                        vendor: { $ref: '#/components/schemas/Vendor' }
                    }
                },
                AddCartItemPayload: {
                    type: 'object',
                    required: ['vendorProductId', 'quantity'],
                    properties: {
                        vendorProductId: { type: 'string', format: 'uuid' },
                        quantity: { type: 'integer', minimum: 1 }
                    }
                },
                // --- User Schemas ---
                Role: {
                    type: 'string',
                    "enum": ['CUSTOMER', 'VENDOR_ADMIN', 'SHOPPER_STAFF', 'ADMIN']
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string', nullable: true },
                        email: { type: 'string', format: 'email', nullable: true },
                        mobileNumber: { type: 'string' },
                        role: { $ref: '#/components/schemas/Role' },
                        mobileVerified: { type: 'boolean' },
                        active: { type: 'boolean' },
                        language: { type: 'string', nullable: true },
                        notification: { type: 'object', additionalProperties: true, nullable: true },
                        referralCode: { type: 'string', nullable: true },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' }
                    }
                },
                UpdateUserPayload: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', nullable: true },
                        email: { type: 'string', format: 'email', nullable: true },
                        mobileNumber: { type: 'string' },
                        role: { $ref: '#/components/schemas/Role' },
                        mobileVerified: { type: 'boolean' },
                        active: { type: 'boolean' },
                        language: { type: 'string', nullable: true },
                        notification: { type: 'object', additionalProperties: true, nullable: true },
                        referralCode: { type: 'string', nullable: true }
                    }
                },
                Verification: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        mobileNumber: { type: 'string' },
                        code: { type: 'string' },
                        expiresAt: { type: 'string', format: 'date-time' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                PaginatedUsers: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalCount: { type: 'integer' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/User' }
                        }
                    }
                },
                // --- Vendor Schemas ---
                VendorOpeningHours: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        day: { type: 'string', "enum": ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
                        open: { type: 'string', example: '09:00' },
                        close: { type: 'string', example: '18:00' }
                    }
                },
                VendorWithRelations: {
                    allOf: [
                        { $ref: '#/components/schemas/Vendor' },
                        {
                            type: 'object',
                            properties: {
                                user: { $ref: '#/components/schemas/User' },
                                openingHours: {
                                    type: 'array',
                                    items: { $ref: '#/components/schemas/VendorOpeningHours' }
                                }
                            }
                        },
                    ]
                },
                CreateVendorPayload: {
                    type: 'object',
                    required: ['name'],
                    properties: {
                        name: { type: 'string', example: 'My Awesome Store' },
                        email: { type: 'string', format: 'email', nullable: true },
                        tagline: { type: 'string', nullable: true },
                        details: { type: 'string', nullable: true },
                        image: { type: 'string', format: 'uri', nullable: true },
                        address: { type: 'string', nullable: true },
                        longitude: { type: 'number', format: 'float', nullable: true },
                        latitude: { type: 'number', format: 'float', nullable: true },
                        meta: { type: 'object', additionalProperties: true, nullable: true }
                    }
                },
                UpdateVendorPayload: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        tagline: { type: 'string' },
                        details: { type: 'string' },
                        image: { type: 'string', format: 'uri' },
                        address: { type: 'string' },
                        longitude: { type: 'number', format: 'float' },
                        latitude: { type: 'number', format: 'float' },
                        isVerified: { type: 'boolean' },
                        meta: { type: 'object', additionalProperties: true }
                    }
                },
                PaginatedVendors: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalCount: { type: 'integer' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/Vendor' }
                        }
                    }
                },
                PaginatedVendorProducts: {
                    type: 'object',
                    properties: {
                        page: { type: 'integer' },
                        totalPages: { type: 'integer' },
                        pageSize: { type: 'integer' },
                        totalCount: { type: 'integer' },
                        data: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/VendorProductWithRelations' }
                        }
                    }
                },
                DeliveryPathPoint: {
                    type: 'object',
                    description: 'A single geographic point in a delivery path.',
                    properties: {
                        latitude: { type: 'number', format: 'float' },
                        longitude: { type: 'number', format: 'float' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                DeliveryPersonLocation: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        orderId: { type: 'string', format: 'uuid' },
                        latitude: { type: 'number', format: 'float' },
                        longitude: { type: 'number', format: 'float' },
                        createdAt: { type: 'string', format: 'date-time' }
                    }
                },
                // --- Vendor Opening Hours Schemas ---
                DaysEnum: {
                    type: 'string',
                    "enum": ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                },
                UpdateOpeningHoursPayload: {
                    type: 'object',
                    required: ['vendorId', 'day'],
                    properties: {
                        vendorId: {
                            type: 'string',
                            format: 'uuid',
                            description: 'The ID of the vendor whose hours are being updated.'
                        },
                        day: {
                            $ref: '#/components/schemas/DaysEnum'
                        },
                        open: {
                            type: 'string',
                            example: '08:30',
                            description: 'The opening time in HH:mm format.'
                        },
                        close: { type: 'string', example: '19:00', description: 'The closing time in HH:mm format.' }
                    }
                }
            }
        },
        tags: [
            {
                name: 'Auth',
                description: 'Authentication and user management'
            },
            {
                name: 'General',
                description: 'General utility endpoints'
            },
            {
                name: 'User',
                description: 'User management endpoints'
            },
            {
                name: 'Vendor',
                description: 'Vendor management endpoints'
            },
            {
                name: 'Product',
                description: 'Product management endpoints'
            },
            {
                name: 'Category',
                description: 'Category management endpoints'
            },
            {
                name: 'Tag',
                description: 'Tag management endpoints'
            },
            {
                name: 'Order',
                description: 'Order management endpoints'
            },
            {
                name: 'Delivery',
                description: 'Endpoints related to order delivery tracking.'
            },
            {
                name: 'Delivery Address',
                description: 'Delivery address management endpoints'
            },
            {
                name: 'Fee',
                description: 'Fee management and calculation endpoints'
            },
            {
                name: 'Cart',
                description: 'Shopping cart operations'
            },
            {
                name: 'CartItem',
                description: 'Operations for individual items in a cart or order'
            },
            {
                name: 'General Search',
                description: 'Endpoints for general site-wide search functionality.'
            },
            {
                name: 'VendorOpeningHours',
                description: 'Manage opening hours for vendors'
            },
        ]
    },
    apis: ['./src/controllers/*.ts', './src/routes/**/*.ts']
};
var swaggerSpec = swagger_jsdoc_1["default"](options);
exports["default"] = swaggerSpec;
