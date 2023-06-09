import { Resolver, Query, Mutation, Arg, Args, Authorized } from 'type-graphql';
import { CategoryService } from './service';
import {
  Category,
  CategoryAncestorsArgs,
  CategoryArgs,
  CategoryChildrenArgs,
  NewCategory,
  RemoveCategoryArgs,
  EditCategoryArgs,
} from './schema';

@Resolver()
export class CategoryResolver {
  @Authorized()
  @Query(() => [Category])
  async category(
    @Args() { slug }: CategoryArgs
  ): Promise<Category[]> {
    return new CategoryService().list(slug);
  }

  @Authorized()
  @Query(() => [Category])
  async categoryChildren(
    @Args() { slug }: CategoryChildrenArgs
  ): Promise<Category[]> {
    return new CategoryService().children(slug);
  }

  @Authorized()
  @Query(() => [Category])
  async categoryAncestors(
    @Args() { slug }: CategoryAncestorsArgs
  ): Promise<Category[]> {
    return new CategoryService().ancestors(slug);
  }

  @Authorized()
  @Mutation(() => Category)
  async addCategory(
    @Arg('input') input: NewCategory,
  ): Promise<Category> {
    return new CategoryService().add(input.slug, input.name, input.parent);
  }

  @Authorized()
  @Mutation(() => Category)
  async removeCategory(
    @Args() { slug }: RemoveCategoryArgs
  ): Promise<Category> {
    return new CategoryService().remove(slug);
  }

  @Authorized()
  @Mutation(() => Category)
  async editCategory(
    @Args() { slug, name, parent }: EditCategoryArgs
  ): Promise<Category> {
    return new CategoryService().edit(slug, name, parent);
  }
}
