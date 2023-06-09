import * as React from 'react';
import { gql, GraphQLClient } from 'graphql-request';
import Router from 'next/router';
import Layout from '../../components/layout/Layout';
import AuthGuard from '../../components/common/AuthGuard';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import fetch from 'node-fetch';
import FormData from 'form-data';
import { useAppContext } from '../../context';
import CreateLayout from '../../components/layout/CreateLayout';
import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations((context.locale as string) ?? 'en', ['common'])),
      locale: (context.locale as string) ?? 'en',
    },
  };
};

export default function Create({ locale }: { locale: string }) {
  const { signedInUser } = useAppContext();

  const handleCancel = () => {
    Router.push({
      pathname: '/',
    });
  };

  const handleCreate = async (
    name: string,
    description: string,
    price: number,
    category: string,
    quantity: number,
    images: File[]
  ) => {
    // const bearerToken = signedInUser?.accessToken;
    const formData: FormData = new FormData();
    images.map((picture: File) => {
      formData.append('files', picture, picture.name);
    });

    const imageData = await fetch('http://localhost:4001/api/v0/image', {
      method: 'POST',
      body: formData,
    });

    const imagesIdArr: string[] = await imageData.json();

    const graphQLClient = new GraphQLClient('http://localhost:3000/api/graphql',  {
      headers: {
        Authorization: `Bearer ${signedInUser?.accessToken}`,
      },
    });
    const query = gql`
        mutation addProduct {
            addProduct (product: {
                name: "${name}",
                description: "${description}",
                price: ${price},
                category: "${category}",
                quantity: ${quantity},
                images: [${imagesIdArr.map((p: string) => `"${p}"`)}],
            }) {id}
        }
    `;

    await graphQLClient
      .request(query)
      .then(() => Router.push({
        pathname: '/',
      })
      )
      .catch(err => {
        imagesIdArr.forEach((pic: string) => {
          fetch(`http://localhost:4001/api/v0/image/${pic}`, {
            method: 'DELETE',
          });
        });
        console.log(err);
        alert('Error creating product, Try again');
      });
  };

  return (
    <AuthGuard>
      <Layout locale={locale} disableSidebarToggle>
        <CreateLayout handleCreate={handleCreate} handleCancel={handleCancel} />
      </Layout>
    </AuthGuard>
  );
}
