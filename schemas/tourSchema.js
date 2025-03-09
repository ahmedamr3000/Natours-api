const tourSchema = {
    type: "object",
    properties: {
        _id: { type: "string", example: "65e4abe58442067a5d7d7aac" },
        name: { type: "string", example: "the mountain biker" },
        duration: { type: "integer", example: 7 },
        durationInWeeks: { type: "integer", example: 1 },
        maxGroupSize: { type: "integer", example: 15 },
        difficulty: { type: "string", example: "medium" },
        price: { type: "number", example: 997 },
        summary: { type: "string", example: "Exploring the jaw-dropping US east coast by foot and by boat" },
        description: { type: "string", example: "Lorem ipsum dolor sit amet, consectetur..." },
        imageCover: { type: "string", example: "tour-cover.jpg" },
        images: {
            type: "array",
            items: { type: "string" },
            example: ["tour-1.jpg", "tour-2.jpg", "tour-3.jpg"]
        },
        ratingsQuantity: { type: "integer", example: 6 },
        ratingsAverage: { type: "number", example: 4.8 },
        startDates: {
            type: "array",
            items: { type: "string", format: "date-time" },
            example: ["2021-06-19T09:00:00.000Z", "2021-07-20T09:00:00.000Z"]
        },
        secret: { type: "boolean", example: false },
        slug: { type: "string", example: "the-mountain-biker" },
        startLocation: {
            type: "object",
            properties: {
                type: { type: "string", example: "Point" },
                coordinates: {
                    type: "array",
                    items: { type: "number" },
                    example: [-80.185942, 25.774772]
                },
                address: { type: "string", example: "301 Biscayne Blvd, Miami, FL 33132, USA" },
                description: { type: "string", example: "Miami, USA" }
            }
        },
        locations: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    type: { type: "string", example: "Point" },
                    coordinates: {
                        type: "array",
                        items: { type: "number" },
                        example: [-80.128473, 25.781842]
                    },
                    description: { type: "string", example: "Lummus Park Beach" },
                    day: { type: "integer", example: 1 }
                }
            }
        },
        guides: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    _id: { type: "string", example: "5c8a22c62f8fb814b56fa18b" },
                    name: { type: "string", example: "Miyah Myles" },
                    email: { type: "string", format: "email", example: "miyah@example.com" },
                    role: { type: "string", example: "lead-guide" },
                    photo: { type: "string", example: "user-12.jpg" }
                }
            }
        },
        reviews: {
            type: "array",
            items: { type: "object" },
            example: []
        }
    }
};

module.exports = tourSchema;
