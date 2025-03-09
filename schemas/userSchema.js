const userSchema = {
    type: "object",
    properties: {
        _id: { type: "string", example: "5c8a1dfa2f8fb814b56fa181" },
        name: { type: "string", example: "adel kamel" },
        email: { type: "string", example: "adelkamel.developer@gmail.com" },
        role: { type: "string", example: "user" },
        active: { type: "boolean", example: true },
        photo: { type: "string", example: "user-2.jpg" },
    }
}

module.exports = userSchema