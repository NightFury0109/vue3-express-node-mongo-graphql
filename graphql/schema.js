const { buildSchema } = require('graphql');

module.exports = buildSchema(`

    type Post {
        _id: ID!
        title: String!
        content: String!
        tags: String!
        imageUrl: String!
        alterText: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        role: String!
        posts: [Post!]!
    }

    type AuthData {
        token: String!
        userId: String!
    }

    type Msg {
        msg: String!
    }

    type PostData {
        posts: [Post!]!
        totalPosts: Int!
    }

    input UserInputData {
        name: String!
        email: String!
        password: String!
    }

    input LoginInputData {
        email: String!
        password: String!
    }

    input ResetPwInputData {
        userId: String!
        token: String!
        password: String!
        password2: String!
    }

    input PostInputData {
        title: String!
        content: String!
        imageUrl: String!
        tags: String!
        alterText: String!
    }

    type RootQuery {
        login(loginInput: LoginInputData): AuthData!
        posts(page: Int): PostData!
        post(postId: ID!): Post!
        user: User!
        sendMail(email: String!): Msg!
    }

    type RootMutation {
        createUser(userInput: UserInputData): User!
        createPost(postInput: PostInputData): Post!
        updatePost(postId: ID!, postInput: PostInputData!): Post!
        deletePost(postId: ID!): Boolean
        resetPassword(data: ResetPwInputData): Boolean
    }

    schema {
        query: RootQuery
        mutation: RootMutation
    }
`);
