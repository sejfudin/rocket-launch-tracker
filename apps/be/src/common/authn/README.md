# Authentication Module (authn)

Provides authentication helpers.

## Glossary

- `authn`: Short for **Auth**enticatio**n**.
- `authz`: Short for **Auth**ori**z**ation.

- `AuthnIdentity`: A authenticated user's identity, the glue between the user and the provider.
- `UserAuthModule`: The module that consumes the `AuthnModule` and provides the `User` and `UserCheck` decorators and handles the user registration and management.
- `Nonce`: A single use token.

## Identity

Contains all the information from a auth provider about a single user.

- `providerId`: Provider specific (in most cases also provider client instance specific) id
- `providerData`: Names, emails, pictures and other data, retrieved from providers.
- `namespace`: Tenant name, allowing for multiple authentications with the same provider combination
- `userId`: Id of the user model specific to this namespace
- `disabled` and `verified`: Use case specific usage to ban/confirm users

## Nonce

Storage of magic links, password resets, and other types of ephemeral, single use tokens.

- `authId`: Link back to Identity
- `type`: Magiclink, forgot password, etc.
- `hashedNonce`: Makes sure the token is not stored in the database
- `usedAt` and `usedData`: Keep a log of usages

## Decorators

It is the `UserAuthModule` responsibility to make `request.user` (AuthnIdentity) avaliable - but this module provides some helpers.

```typescript
@Get('/user-features')
async getUserFeatures(
  @AuthnIdentity() user: IAuthnIdentity,
): Promise<PaginationDto<FeatureResponseDTO>> {
    console.log(user.userId)
}
```

You can also omit AuthnIdentity and just use the provider data.

```typescript
@Get('/user-features')
async getUserFeatures(
  @AuthnProviderIdentity() user: IAuthnProviderIdentity,
): Promise<PaginationDto<FeatureResponseDTO>> {
    console.log(user.providerId)
}
```
