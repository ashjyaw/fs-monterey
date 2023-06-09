import request, { gql } from 'graphql-request';
import { Category } from './schema';

export class CategoryService {
  public async list(slug?: string): Promise<Category[]> {
    const mutation = gql`
      query ListCategories($slug: String) {
        category(slug: $slug) {
          slug, name, parent
        }
      }
    `;

    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { slug: slug },
    );

    return data.category;
  }

  public async children(slug?: string): Promise<Category[]> {
    const mutation = gql`
      query CategoryChildren($slug: String) {
        categoryChildren(slug: $slug) {
          slug, name, parent
        }
      }
    `;

    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { slug: slug },
    );

    return data.categoryChildren;
  }

  public async ancestors(slug: string): Promise<Category[]> {
    const mutation = gql`
      query CategoryAncestors($slug: String!) {
        categoryAncestors(slug: $slug) {
          slug, name, parent
        }
      }
    `;

    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { slug: slug },
    );

    return data.categoryAncestors;
  }

  public async add(slug: string, name: string, parent?:string): Promise<Category> {
    const mutation = gql`
      mutation AddCategory($input: CategoryInput!) {
        addCategory(input: $input) {
          slug, parent, name
        }
      }
    `;

    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { input: { name: name, parent: parent, slug: slug } },
    );


    return data.addCategory;
  }

  public async remove(slug: string): Promise<Category> {
    const mutation = gql`
      mutation RemoveCategory($slug: String!) {
        removeCategory(slug: $slug) {
          slug, parent, name
        }
      }
    `;
    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { slug: slug },
    );

    return data.removeCategory;
  }

  public async edit(slug:string, name?:string, parent?:string): Promise<Category>{
    const mutation = gql`
      mutation EditCategory($slug: String!, $name: String, $parent: String) {
        editCategory(slug: $slug, name: $name, parent: $parent) {
          slug, parent, name
        }
      }
    `;
    const data = await request(
      'http://localhost:4002/graphql',
      mutation,
      { slug: slug, name: name, parent: parent },
    );


    return data.editCategory;
  }
}
