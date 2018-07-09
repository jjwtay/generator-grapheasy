import { makeExecutableSchema } from 'graphql-tools'
import { importSchema, } from 'graphql-import'
import { schemaToJS } from 'graphschematojson'
import { writeFileSync, existsSync, mkdirSync, readFileSync } from 'fs'
import { GraphQLServer } from 'graphql-yoga'
import {createConnection, EntitySchema} from "typeorm"
import {
    queryTemplate,
    mutationTemplate,
    getQueryResolvers,
    getMutationResolvers,
    getRepositories,
    getEntitySchemas,
    OneToOne,
    OneToMany,
    ManyToOne,
    ManyToMany
} from 'graphql_typeorm'

const typeDefs = importSchema('./schemas/schema.graphql')
const schema = makeExecutableSchema({typeDefs, resolvers: {}})
const jsSchema = schemaToJS(schema)

if (!existsSync('./schemas')) {
    mkdirSync('./schemas')
}
writeFileSync(`./schemas/query.graphql`, queryTemplate(jsSchema))
writeFileSync(`./schemas/mutation.graphql`, mutationTemplate(jsSchema))

const connection = createConnection({
    type: "<%= type %>",
    host: "<%= host %>",
    port: <%= port %>,
    username: "<%= username %>",
    password: "<%= password %>",
    database: "<%= dbname %>",
    entities: getEntitySchemas(jsSchema).map(schema => new EntitySchema(schema)),
    synchronize: true
}).then(connection => {

    const server = new GraphQLServer({
        typeDefs: [
            importSchema('./schemas/schema.graphql'),
            readFileSync('./schemas/mutation.graphql').toString(),
            readFileSync('./schemas/query.graphql').toString()
        ],
        resolvers: {...getQueryResolvers(jsSchema), ...getMutationResolvers(jsSchema)},
        context: {
            repositories: getRepositories({schema: jsSchema, connection}),
            connection
        },
        schemaDirectives: {
            OneToOne,
            OneToMany,
            ManyToOne,
            ManyToMany,
        }

    })
    server.start(() => console.log('Server is running on localhost:4000'))
}).catch(error => {
    console.log(error)
})