import type { PrismaClient } from '~database/prisma/client';

export abstract class PrismaFixture<T> {
  abstract entity: T;
}

export type FixtureGenerator<TEntity, TData, TRelations> = (
  prismaClient: PrismaClient,
  data?: Partial<TData>,
  relations?: TRelations,
) => Promise<PrismaFixture<TEntity>>;

/**
 * Interface for a fixture class with static fromPartial method
 */
interface FixtureClass<TEntity, TFixture extends PrismaFixture<TEntity>> {
  new (): TFixture;
  fromPartial(prismaClient: PrismaClient, data?: Partial<TEntity>, relations?: unknown): Promise<TFixture>;
}

/**
 * Resolves a fixture from context.
 * If entity is already a fixture instance, returns it.
 * If entity is partial data, creates a new fixture using the FixtureClass.
 * If entity is undefined, creates a default fixture.
 */
export async function resolveFixture<TEntity, TFixture extends PrismaFixture<TEntity>>(
  prismaClient: PrismaClient,
  FixtureClass: FixtureClass<TEntity, TFixture>,
  entity?: TFixture | Partial<TEntity>,
): Promise<TFixture> {
  // If it's already a fixture instance (has 'entity' property), return it
  // Fixture instances have 'entity' property, class constructors don't
  if (entity && typeof entity === 'object' && 'entity' in entity) {
    return entity;
  }
  // Otherwise, create a new fixture from the partial data (or undefined for defaults)
  return FixtureClass.fromPartial(prismaClient, entity);
}
