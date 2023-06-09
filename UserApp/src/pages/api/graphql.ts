import { createYoga } from 'graphql-yoga';
import 'reflect-metadata'; // must come before buildSchema
import { buildSchemaSync } from 'type-graphql';

import { AuthResolver } from '../../graphql/auth/resolver';
import { nextAuthChecker } from '../../graphql/auth/checker';
import { ProductResolver } from '../../graphql/product/resolver';
import { CategoryResolver } from '../../graphql/category/resolver';
import { UserResolver } from '../../graphql/user/resolver';
import { ChatResolver } from '../../graphql/chat/resolver';
import { MessageResolver } from '../../graphql/message/resolver';

const schema = buildSchemaSync({
  resolvers: [
    AuthResolver,
    ProductResolver,
    CategoryResolver,
    UserResolver,
    ChatResolver,
    MessageResolver,
  ],
  validate: { forbidUnknownValues: false },
  authChecker: nextAuthChecker,
});

export default createYoga({
  schema,
  // Defined explicitly because our endpoint lives at a different path other than `/graphql`
  graphqlEndpoint: '/api/graphql',
});
