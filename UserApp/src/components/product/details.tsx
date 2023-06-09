import { Product } from '@/graphql/product/schema';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardOverflow,
  Chip,
  Input,
  Sheet,
  Stack,
  Table,
  Tooltip,
  Typography,
} from '@mui/joy';
import Link from 'next/link';
import { gql, GraphQLClient } from 'graphql-request';
import { useAppContext } from '../../context';
import { Chat } from '../../graphql/chat/schema';
import Router from 'next/router';
import { useState } from 'react';
import ImageGallery from '../image/gallery';

interface FormElements extends HTMLFormControlsCollection {
  message: HTMLInputElement;
}

interface MessageFormElement extends HTMLFormElement {
  readonly elements: FormElements;
}

export default function ProductDetails({ product }: { product: Product }) {
  const { signedInUser } = useAppContext();
  const [sent, setSent] = useState<string | undefined>('Send');

  const handleSubmit = async (message: string) => {
    if (!signedInUser) {
      Router.push({
        pathname: '/signin',
      });
      return;
    }

    setSent('Sending...');

    const graphQLClient = new GraphQLClient(
      'http://localhost:3000/api/graphql',
      {
        headers: {
          Authorization: `Bearer ${signedInUser?.accessToken}`,
        },
      },
    );

    let mutation = gql`
        mutation addChat {
          addChat (name: "${product.name}") {
            id
            name
          }
        }
    `;
    const data: { addChat: Chat } = await graphQLClient.request(mutation);

    mutation = gql`
        mutation addChatMember {
          addChatMember (id: "${data.addChat.id}"){
            username
          }
        }
    `;
    await graphQLClient.request(mutation);

    mutation = gql`
        mutation addChatMember {
          addChatMember (username: "${product.user}", id: "${data.addChat.id}"){
            username
          }
        }
    `;
    await graphQLClient.request(mutation);

    mutation = gql`
        mutation sendMessage {
          sendMessage (message: {
            chat_id: "${data.addChat.id}",
            content: "${message}"
          }) { sender, content, date }
        }
    `;
    await graphQLClient.request(mutation);

    setSent('Sent');
    Router.push({
      pathname: `/messages/${data.addChat.id}`,
    });
  };

  return (
    <Box maxWidth="lg" margin="auto" p={4}>
      <Typography pb={2} level="h2">
        {product.name}
      </Typography>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 'xl',
          gap: 4,
          pb: 0,
          flexDirection: {
            md: 'row',
          },
        }}
      >
        <CardOverflow sx={{ flexGrow: 1 }}>
          <ImageGallery images={product.images}/>
        </CardOverflow>
        <Stack
          gap={2}
          pb={2}
          sx={{
            width: {
              md: 'min(500px, 50vw)',
              sm: '100%',
            },
          }}
        >
          {product.discount > 0 ? (
            <Box>
              <Typography level="h2">
                {`$${(product.price - product.price * product.discount).toFixed(2)} `}
              </Typography>
              <Typography level="h6">
                <Typography sx={{ textDecoration: 'line-through' }}>
                  ${product.price.toFixed(2)}
                </Typography>
                <Typography color="danger" fontWeight="lg">
                  {` Save ${product.discount * 100}%`}
                </Typography>
              </Typography>
            </Box>
          ) : (
            <Typography level="h2">${product.price.toFixed(2)}</Typography>
          )}
          <Link href={`/user/${product.user}`}>
            <Stack direction="row" alignItems="center" gap={1}>
              <Avatar src={`https://robohash.org/${product.user}`} />
              <Typography>{product.user}</Typography>
            </Stack>
          </Link>
          <Stack direction="row" alignItems="center" gap={1}>
            <Link href={`/category/${product.category}`}>
              <Chip variant="soft">{product.category}</Chip>
            </Link>
            <Typography level="body2">
              {new Date(product.date).toLocaleDateString('en-US')}
            </Typography>
          </Stack>
          <Typography noWrap>{product.description}</Typography>
          {product.attributes.length > 0 && (
            <Sheet
              variant="outlined"
              sx={{
                maxHeight: { sm: 'none', md: 250 },
                overflowY: { sm: 'none', md: 'scroll' },
                borderRadius: 'var(--joy-radius-sm)',
              }}
            >
              <Table stripe="odd">
                <tbody>
                  {product.attributes.map(({ id, name, value, symbol }) => (
                    <tr key={id}>
                      <td>
                        <b>{name}</b>
                      </td>
                      <td>
                        {value[0] === '#' ? (
                          <Color value={value} />
                        ) : (
                          `${value} ${symbol || ''}`
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Sheet>
          )}
          <form
            onSubmit={(event: React.FormEvent<MessageFormElement>) => {
              event.preventDefault();
              const formElements = event.currentTarget.elements;
              handleSubmit(formElements.message.value);
            }}
            style={{ marginTop: 'auto', backgroundColor: 'background.body' }}
          >
            <Stack direction="column" spacing={1}>
              {signedInUser?.username === product.user ? (
                <>
                  <Input
                    name="message"
                    placeholder="Hi, is this available?"
                    defaultValue="Hi, is this available?"
                    sx={{ bgcolor: 'background.body' }}
                  />
                  <Tooltip size="lg" title="Talk to yourself often?" arrow>
                    <Box sx={{ cursor: 'not-allowed' }}>
                      <Button
                        size="lg"
                        type="submit"
                        disabled
                        sx={{ width: '100%' }}
                      >
                        {sent}
                      </Button>
                    </Box>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Input
                    name="message"
                    placeholder="Hi, is this available?"
                    defaultValue="Hi, is this available?"
                    sx={{ bgcolor: 'background.body' }}
                  />
                  <Button size="lg" type="submit">
                    {sent}
                  </Button>
                </>
              )}
            </Stack>
          </form>
        </Stack>
      </Card>
    </Box>
  );
}

function Color({ value }: { value: string }) {
  return (
    <Box
      width={40}
      height={20}
      borderRadius={20}
      bgcolor={value}
      border="1px solid var(--joy-palette-neutral-outlinedBorder)"
    />
  );
}
