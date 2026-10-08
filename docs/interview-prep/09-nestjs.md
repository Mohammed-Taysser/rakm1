# NestJS (44 questions)

> NestJS is the opinionated, TypeScript-first Node.js framework that wraps Express (or Fastify) in a layer of Angular-inspired structure: modules, dependency injection, decorators, and a well-defined request lifecycle. It matters in interviews because it forces you to articulate _architecture_ — how DI containers work, how guards/interceptors/pipes/filters compose, and how to keep large apps maintainable. You have shipped serious NestJS systems: a **Pharmacy FEFO multi-tenant** platform (request-scoped tenancy, Prisma client extensions for per-tenant filtering, FEFO batch expiry logic) and **CineBite**, a full **DDD + CQRS** app (CommandBus/QueryBus/EventBus, aggregates, domain events) with TypeScript, Prisma/TypeORM, class-validator DTOs, JWT auth guards, Swagger, and BullMQ background jobs. This file drills the concepts those projects exercise so you can defend every design decision.

## Quick Revision Checklist

- NestJS = opinionated layer over Express/Fastify with **DI**, **modules**, **decorators**, and a fixed **request lifecycle**.
- `@Module({ imports, controllers, providers, exports })` is the unit of organization; only `exports`ed providers are visible to importing modules.
- DI container resolves providers by **token** (usually the class). Default scope is **singleton**; also `REQUEST` and `TRANSIENT`.
- Custom providers: `useClass`, `useValue`, `useFactory` (can `inject` deps + be async), `useExisting` (alias).
- **Request lifecycle order:** middleware → guards → interceptors (pre) → pipes → handler → interceptors (post) → exception filters.
- **Guards** decide _can this proceed_ (authz/authn) using `CanActivate`; combine `@SetMetadata`/custom decorators + `Reflector` for roles.
- **Interceptors** wrap the handler with RxJS (transform responses, logging, caching, timeout); they run before AND after.
- **Pipes** transform/validate inputs; global `ValidationPipe` + class-validator DTOs with `whitelist` + `forbidNonWhitelisted` + `transform`.
- **Exception filters** catch thrown exceptions; extend the `HttpException` hierarchy or build custom ones.
- **Dynamic modules** (`forRoot`/`forRootAsync`) configure modules at import time (ConfigModule, TypeOrmModule, JwtModule).
- Passport: `PassportStrategy` (JWT/local) + `AuthGuard('jwt')`; `validate()` return becomes `request.user`.
- **CQRS** (`@nestjs/cqrs`): Commands (writes) via `CommandBus`, Queries (reads) via `QueryBus`, Events via `EventBus` — used in CineBite.
- Lifecycle hooks: `onModuleInit`, `onApplicationBootstrap`, `onModuleDestroy`, `onApplicationShutdown` (needs `enableShutdownHooks()`).
- Integrations: `@nestjs/config`, `@nestjs/swagger`, `@nestjs/bullmq`, `CacheModule`, `@nestjs/schedule`, WebSocket gateways.
- **Multi-tenancy** (Pharmacy): request-scoped tenant context + Prisma client extensions (`$extends`) to inject `tenantId` filters.
- Testing: `Test.createTestingModule({...})`, override providers with mocks, `module.get(Token)`.

## Basic

### Q1: What is NestJS and why use it over plain Express?

**A:** NestJS is a progressive Node.js framework built with and for TypeScript. Under the hood it uses Express by default (Fastify optional via a swappable HTTP adapter). It adds an opinionated architecture inspired by Angular: **modules** for organization, a **dependency-injection** container, **decorators** (`@Controller`, `@Injectable`, `@Get`) for metadata, and a structured request lifecycle. Plain Express is unopinionated — you wire middleware and routes manually with no enforced structure, no built-in DI, and no first-class TypeScript metadata. Nest gives you testability (DI makes mocking trivial), consistency across a team, and out-of-the-box patterns for guards, pipes, interceptors, and filters.

**Tip:** The phrase interviewers want: "Nest is opinionated and TS-first; it standardizes structure and provides DI so large teams stay consistent and code stays testable."

### Q2: What is a module in NestJS?

**A:** A module is a class annotated with `@Module()` that groups related controllers and providers. The decorator takes `imports` (other modules whose exports you need), `controllers` (route handlers), `providers` (injectables instantiated by the DI container, scoped to this module), and `exports` (the subset of providers this module makes available to modules that import it). Every app has at least one root module (`AppModule`). Modules form a tree and define the boundaries of the DI scope.

**Tip:** A provider is only injectable in another module if the declaring module `exports` it AND the consuming module `imports` the declaring module. Forgetting `exports` is the #1 cause of "Nest can't resolve dependencies" errors.

### Q3: What is a controller and how do you define routes?

**A:** A controller is a class decorated with `@Controller('prefix')` whose methods handle incoming requests. HTTP-method decorators map methods to routes: `@Get()`, `@Post()`, `@Put()`, `@Patch()`, `@Delete()`. Parameter decorators extract data: `@Param('id')`, `@Query('page')`, `@Body()`, `@Headers()`, `@Req()`/`@Res()` (raw request/response). Nest infers the success status (200 for GET, 201 for POST) but you can override with `@HttpCode(204)`.

```ts
@Controller("products")
export class ProductsController {
  constructor(private readonly products: ProductsService) {}

  @Get()
  findAll(@Query("page") page = 1) {
    return this.products.findAll(+page);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.products.findOne(id);
  }

  @Post()
  @HttpCode(201)
  create(@Body() dto: CreateProductDto) {
    return this.products.create(dto);
  }
}
```

**Tip:** Prefer letting Nest manage the response (return a value) over `@Res()`. Once you inject `@Res()` you opt out of Nest's response handling (interceptors that transform the body stop working) unless you pass `{ passthrough: true }`.

### Q4: What is a provider / service and how is `@Injectable()` used?

**A:** A provider is any value the DI container can inject — most commonly a **service** class decorated with `@Injectable()`. `@Injectable()` marks the class as a candidate for DI so Nest can instantiate it and supply its own constructor dependencies. Services hold business logic and are kept thin in controllers ("controllers route, services do work"). You register them in a module's `providers` array; Nest then injects them via constructor parameters.

**Tip:** Anything can be a provider, not just services — repositories, factories, helpers, even plain values via custom providers. `@Injectable()` is technically only required when the class itself has injected dependencies, but always adding it is the safe convention.

### Q5: How does constructor-based dependency injection work in Nest?

**A:** You declare a dependency as a constructor parameter with a type annotation. Nest reads the parameter's type metadata (emitted by TypeScript's `emitDecoratorMetadata`), looks up a provider registered under that type's **token**, resolves it (recursively resolving its own dependencies), and passes the instance in. Using `private readonly` on the parameter both injects and assigns it as a class property.

**Tip:** This relies on `experimentalDecorators` and `emitDecoratorMetadata` in `tsconfig.json` — without them DI silently breaks. For interface or token-based injection (no runtime type) you must use `@Inject(TOKEN)`.

### Q6: What's the difference between a controller and a service?

**A:** A controller is the HTTP boundary: it parses the request (params, query, body), delegates to services, and shapes the response. A service is a reusable provider containing business logic with no knowledge of HTTP. This separation keeps logic testable (you can unit-test a service without spinning up HTTP) and reusable (multiple controllers, jobs, or CQRS handlers can call the same service).

**Tip:** A red flag in interviews is putting DB queries or business rules directly in the controller. Controllers should be thin.

### Q7: What is a DTO and why use one?

**A:** A DTO (Data Transfer Object) is a class that defines the shape of data crossing a boundary — typically the request body. In Nest, DTOs are classes (not interfaces) so they survive at runtime, which lets class-validator decorators (`@IsString`, `@IsEmail`, `@Min`) and class-transformer run on them. They give you validation, type safety, and auto-generated Swagger schemas.

**Tip:** Use a **class**, not a TypeScript `interface`, for DTOs — interfaces are erased at compile time, so validation decorators and Swagger introspection wouldn't work.

### Q8: How do you validate request bodies?

**A:** Register the global `ValidationPipe`, define DTO classes with class-validator decorators, and Nest validates incoming bodies automatically.

```ts
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true, // strip props not in the DTO
    forbidNonWhitelisted: true, // 400 if unknown props are sent
    transform: true, // auto-convert payloads to DTO instances + primitives
  }),
);

// create-product.dto.ts
export class CreateProductDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsInt()
  @Min(0)
  stock: number;

  @IsOptional()
  @IsString()
  description?: string;
}
```

**Tip:** `whitelist` + `forbidNonWhitelisted` is your defense against mass-assignment. `transform: true` is what makes `@Query('page')` arrive as a number when the DTO/param type is `number`.

### Q9: How do you validate nested DTOs and write a custom (DB-backed) validator with class-validator?

**A:** For nested objects/arrays, decorate the property with `@ValidateNested()` and `@Type(() => Dto)` from class-transformer — without `@Type`, the nested value stays a plain object and its validators never run. Use `enableImplicitConversion` to coerce primitives globally, and a `@ValidatorConstraint({ async: true })` class for DB-backed checks (which requires `useContainer` so DI works inside validators).

```ts
// nested objects + arrays
export class CreateOrderDto {
  @ValidateNested()
  @Type(() => AddressDto)
  shippingAddress: AddressDto;

  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}
```

```ts
// implicit conversion: query-string "21" -> number, no per-field @Type
app.useGlobalPipes(
  new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
  }),
);
```

```ts
// custom async validator that injects a service and hits the DB
@ValidatorConstraint({ name: "IsEmailUnique", async: true })
@Injectable()
export class IsEmailUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly users: UsersService) {}

  async validate(email: string): Promise<boolean> {
    return !(await this.users.findByEmail(email));
  }

  defaultMessage(): string {
    return "email already in use";
  }
}

export const IsEmailUnique =
  (opts?: ValidationOptions) => (object: object, propertyName: string) =>
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: opts,
      validator: IsEmailUniqueConstraint,
    });

// main.ts — REQUIRED for DI inside validators
useContainer(app.select(AppModule), { fallbackOnErrors: true });
```

**Tip:** The `useContainer(...)` line is the thing everyone forgets — without it, injecting a service into a custom validator throws because class-validator uses its own default container instead of Nest's DI.

### Q10: What is the basic project structure of a Nest app?

**A:** A `main.ts` bootstrap file (`NestFactory.create(AppModule)`), a root `AppModule`, and feature folders each containing a `*.module.ts`, `*.controller.ts`, `*.service.ts`, and a `dto/` directory. Feature modules are imported into `AppModule`. This modular structure mirrors domain boundaries.

**Tip:** Use the Nest CLI (`nest g module products`, `nest g resource products`) to scaffold consistently.

## Intermediate

### Q11: Walk through the NestJS request lifecycle in order.

**A:** For an incoming request the order is:

1. **Middleware** (global → module-bound, in registration order)
2. **Guards** (global → controller → route)
3. **Interceptors** (pre-controller logic, in their RxJS pipeline before `next.handle()`)
4. **Pipes** (param/body transformation & validation)
5. **Route handler** (the controller method)
6. **Interceptors** (post-controller logic, after `next.handle()` emits)
7. **Exception filters** (only if something threw anywhere above)
   Finally the response is sent.

**Tip:** Classic gotcha: guards run **before** interceptors and pipes, so the request body has not been validated/transformed yet inside a guard. If your guard needs validated data, that's a design smell.

### Q12: When do you use middleware vs guard vs interceptor vs pipe vs filter? (the classic interview question)

**A:**

- **Middleware** — runs first, has raw `req`/`res`/`next`; use for cross-cutting concerns that don't need Nest's DI context details: logging, request-id injection, CORS, body parsing. It has no access to which handler will run.
- **Guard** — returns boolean (or throws); decides _whether_ the request proceeds. Use for **authentication and authorization**. Has access to the execution context (handler/class metadata via `Reflector`).
- **Interceptor** — wraps the handler with RxJS; runs before and after. Use to **transform responses**, add logging/timing, caching, timeouts, serialization.
- **Pipe** — operates on a single argument; **validate and/or transform** inputs (DTO validation, `ParseIntPipe`).
- **Exception filter** — catches thrown exceptions and shapes the error response.

**Tip:** Memory hook: middleware = "before Nest cares," guard = "may you?", interceptor = "wrap it," pipe = "clean the input," filter = "handle the failure."

### Q13: How do you implement an authentication guard?

**A:** Implement `CanActivate`; in `canActivate()` inspect the request and return `true`/`false` or throw. The cleanest path is to use Passport's `AuthGuard`.

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}

@Controller("orders")
@UseGuards(JwtAuthGuard)
export class OrdersController {
  @Get() findMine(@Req() req) {
    return req.user;
  }
}
```

For a fully custom guard:

```ts
@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest();
    return req.headers["x-api-key"] === process.env.API_KEY;
  }
}
```

**Tip:** Guards run in global → controller → method order, and ALL must return true. Throw `UnauthorizedException`/`ForbiddenException` for meaningful status codes instead of just returning `false` (which yields a generic 403).

### Q14: How do you implement role-based authorization with `@SetMetadata` and `Reflector`?

**A:** Attach required roles as route metadata via a custom decorator, then read them in a guard with `Reflector`.

```ts
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.some((r) => user.roles?.includes(r));
  }
}

// usage
@Roles('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Delete(':id')
remove(@Param('id') id: string) { /* ... */ }
```

**Tip:** `getAllAndOverride` merges method + class metadata with method taking precedence — better than `get()` because it supports decorating either level. Order matters: `JwtAuthGuard` must run before `RolesGuard` so `user` exists.

### Q15: How do you compose a reusable @Auth() decorator with applyDecorators?

**A:** `applyDecorators` merges several decorators into one custom decorator, so a single `@Auth('admin')` applies the guards, the roles metadata, and the Swagger annotation together. Pair it with a `@CurrentUser()` param decorator built via `createParamDecorator` to keep controllers declarative.

```ts
export const Roles = (...roles: Role[]) => SetMetadata("roles", roles);

export function Auth(...roles: Role[]) {
  return applyDecorators(
    UseGuards(JwtAuthGuard, RolesGuard),
    Roles(...roles),
    ApiBearerAuth(),
  );
}
```

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>('roles', [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (!required?.length) return true;
    const { user } = ctx.switchToHttp().getRequest();
    return required.some((r) => user.roles?.includes(r));
  }
}

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest().user,
);

// usage — one decorator wires guards + roles + Swagger
@Auth('admin')
@Delete(':id')
remove(@Param('id') id: string, @CurrentUser() user: User) { /* ... */ }
```

**Tip:** `applyDecorators` is the composition primitive; combining guard + metadata + Swagger into one `@Auth()` is the senior-looking answer — controllers read as intent, not plumbing.

### Q16: How do interceptors work and what's a common use case?

**A:** An interceptor implements `NestInterceptor` with `intercept(context, next)`. Code before `next.handle()` runs pre-controller; `next.handle()` returns an RxJS `Observable` of the handler's response, which you transform with operators like `map`, `tap`, `timeout`, `catchError`. The canonical use is a **transform interceptor** for a consistent response envelope.

```ts
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  { data: T; success: true }
> {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const now = Date.now();
    return next.handle().pipe(
      map((data) => ({
        success: true,
        data,
        timestamp: new Date().toISOString(),
      })),
      tap(() =>
        Logger.log(
          `${ctx.switchToHttp().getRequest().url} +${Date.now() - now}ms`,
        ),
      ),
    );
  }
}
```

**Tip:** Other classic interceptors: `LoggingInterceptor` (timing via `tap`), `TimeoutInterceptor` (RxJS `timeout()` + `RequestTimeoutException`), `CacheInterceptor`, and `ClassSerializerInterceptor` (applies `@Exclude`/`@Expose`).

### Q17: What are pipes and how do you write a custom one?

**A:** Pipes transform or validate a single handler argument. Built-ins include `ParseIntPipe`, `ParseUUIDPipe`, `ParseBoolPipe`, `DefaultValuePipe`, and `ValidationPipe`. A custom pipe implements `PipeTransform`:

```ts
@Injectable()
export class TrimPipe implements PipeTransform {
  transform(value: any) {
    return typeof value === "string" ? value.trim() : value;
  }
}

// usage: @Get(':id') get(@Param('id', ParseIntPipe) id: number) {}
```

**Tip:** If a pipe's transform throws, Nest converts it to a 400 (for `ValidationPipe`/parse pipes). Pipes can be applied globally, per-controller, per-method, or per-parameter — parameter-level pipes are the most granular.

### Q18: How do you handle exceptions and write a custom exception filter?

**A:** Nest has a built-in `HttpException` hierarchy (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, `ConflictException`, etc.). Throwing one produces the right status + JSON. An **exception filter** lets you customize the error shape or handle specific exception types.

```ts
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const status = exception.getStatus();
    res.status(status).json({
      success: false,
      statusCode: status,
      message: exception.getResponse(),
      path: ctx.getRequest().url,
      timestamp: new Date().toISOString(),
    });
  }
}
// app.useGlobalFilters(new HttpExceptionFilter());
```

`@Catch()` with no args catches everything; `@Catch(HttpException)` narrows it.

**Tip:** Create domain exceptions by extending `HttpException` (e.g. `class BatchExpiredException extends BadRequestException`). A catch-all filter (`@Catch()`) is useful for mapping ORM errors (Prisma `P2002` unique violation → 409) to clean HTTP responses.

### Q19: What are the provider scopes and when do you use each?

**A:**

- **DEFAULT (singleton)** — one instance shared app-wide for the provider's lifetime. The default; most efficient.
- **REQUEST** — a new instance per incoming request; injectable `REQUEST` object available. Use for per-request state like the current tenant or user context.
- **TRANSIENT** — a new instance for every consumer that injects it (not shared).

```ts
@Injectable({ scope: Scope.REQUEST })
export class TenantContext {
  constructor(@Inject(REQUEST) private req: Request) {}
  get tenantId() {
    return this.req.headers["x-tenant-id"] as string;
  }
}
```

**Tip:** Request scope "bubbles up": any provider/controller that depends on a request-scoped provider also becomes request-scoped, which has a performance cost (instantiated per request). In the Pharmacy multi-tenant app, a request-scoped tenant context is a deliberate trade-off.

### Q20: Explain custom providers: useClass, useValue, useFactory, useExisting.

**A:**

- **useClass** — `{ provide: TOKEN, useClass: SomeImpl }`: bind a token to a class (swap implementations, e.g. for tests or environments).
- **useValue** — `{ provide: TOKEN, useValue: obj }`: inject a constant/config object or a mock.
- **useFactory** — `{ provide: TOKEN, useFactory: (deps) => ..., inject: [Deps] }`: compute the provider dynamically, with injected dependencies; can be `async`.
- **useExisting** — `{ provide: ALIAS, useExisting: TOKEN }`: create an alias to an existing provider (same instance, two tokens).

```ts
const dbProvider = {
  provide: "DATABASE_CONNECTION",
  useFactory: async (config: ConfigService) => {
    return createConnection({ url: config.get("DATABASE_URL") });
  },
  inject: [ConfigService],
};
@Module({ providers: [dbProvider], exports: ["DATABASE_CONNECTION"] })
export class DatabaseModule {}
```

**Tip:** Non-class tokens (strings/symbols) require `@Inject('DATABASE_CONNECTION')` at the injection site. Prefer `InjectionToken`/symbol constants over magic strings to avoid collisions.

### Q21: What is a dynamic module and what's the forRoot/forRootAsync pattern?

**A:** A dynamic module is one configured at import time. A static method (`forRoot`/`register`) returns a `DynamicModule` object (`{ module, providers, exports, global? }`), letting you pass configuration in. `forRootAsync` resolves config asynchronously, often using `useFactory` + `inject` so you can read from `ConfigService`.

```ts
@Module({})
export class MailModule {
  static forRoot(opts: MailOptions): DynamicModule {
    return {
      module: MailModule,
      providers: [{ provide: MAIL_OPTIONS, useValue: opts }, MailService],
      exports: [MailService],
    };
  }
}
// TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (c) => ({...}) })
```

**Tip:** Convention: `forRoot`/`forRootAsync` = configure once at the root (singletons); `register`/`registerAsync` = configure per feature module (e.g. `BullModule.registerQueue`). `JwtModule`, `ConfigModule`, `TypeOrmModule` all use this.

### Q22: What is a global module?

**A:** A module decorated with `@Global()` exports its providers app-wide without needing to be imported in every consuming module — you import it once (typically in `AppModule`) and its exports are available everywhere.

**Tip:** Use sparingly (config, logging, database). Overusing `@Global()` hides dependencies and undermines the explicitness that makes Nest's DI easy to reason about.

### Q23: How does middleware work and how do you apply it?

**A:** Middleware can be **functional** (a plain `(req, res, next) => {}`) or **class-based** (implements `NestMiddleware` with a `use()` method, can use DI). Class middleware is registered by implementing `NestModule.configure()` and using `MiddlewareConsumer`:

```ts
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`${req.method} ${req.originalUrl}`);
    next();
  }
}
@Module({})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes("*"); // or .exclude(), or { path, method }
  }
}
```

Global functional middleware can also be added in `main.ts` via `app.use()`.

**Tip:** Middleware runs before guards and can't read route metadata (it doesn't know the handler). If you need handler/class metadata, use a guard or interceptor instead.

### Q24: How do you integrate Passport with a JWT strategy?

**A:** Extend `PassportStrategy(Strategy)` from `passport-jwt`, configure token extraction and secret, and implement `validate()` whose return value becomes `request.user`.

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get("JWT_SECRET"),
    });
  }
  async validate(payload: { sub: string; roles: string[] }) {
    return { id: payload.sub, roles: payload.roles };
  }
}
// guard: AuthGuard('jwt'); module imports PassportModule + JwtModule.registerAsync(...)
```

**Tip:** A local strategy (`passport-local`) handles username/password login (`validate(user, pass)`); the JWT strategy handles subsequent authenticated requests. Sign tokens with `JwtService.sign()` in your `AuthService`.

### Q25: How do you use `@nestjs/config` with env validation?

**A:** Import `ConfigModule.forRoot({ isGlobal: true, validationSchema })`, then inject `ConfigService` and call `config.get('KEY')`. A Joi schema (or a class-validator-based validate function) fails fast at boot if required env vars are missing or malformed.

```ts
ConfigModule.forRoot({
  isGlobal: true,
  validationSchema: Joi.object({
    NODE_ENV: Joi.string()
      .valid("development", "production")
      .default("development"),
    DATABASE_URL: Joi.string().required(),
    JWT_SECRET: Joi.string().min(16).required(),
  }),
});
```

**Tip:** `isGlobal: true` saves importing `ConfigModule` everywhere. Use the generic `config.get<number>('PORT')` and consider typed namespaced config (`registerAs`) for large apps.

### Q26: How do you integrate Prisma in NestJS?

**A:** Wrap the Prisma client in an injectable `PrismaService` that connects on module init, then inject it into your services/repositories.

```ts
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }
}
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

**Tip:** Export `PrismaService` from a (often `@Global()`) `PrismaModule`. For graceful shutdown call `enableShutdownHooks()` and disconnect in `onModuleDestroy`. Prisma replaces the repository pattern with its own typed client; some teams still wrap it in repository classes for testability.

### Q27: How do you integrate TypeORM (entities & repositories)?

**A:** `TypeOrmModule.forRoot(...)` (or `forRootAsync`) configures the connection; each feature module calls `TypeOrmModule.forFeature([Entity])` to register repositories, which you inject with `@InjectRepository(Entity)`.

```ts
@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid") id: string;
  @Column() name: string;
  @Column("int", { default: 0 }) stock: number;
}

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}
  findAll() {
    return this.repo.find();
  }
}
```

**Tip:** Disable `synchronize: true` in production (it auto-alters schema — data loss risk); use migrations instead. Use the repository pattern or a custom repository for complex queries.

## Advanced

### Q28: Explain CQRS in NestJS and how you used it in CineBite.

**A:** `@nestjs/cqrs` separates **writes (Commands)** from **reads (Queries)** and propagates **Events**. You import `CqrsModule`, then dispatch through three buses:

- **CommandBus** — execute a `Command` (intent to change state) handled by a `@CommandHandler`.
- **QueryBus** — execute a `Query` (read) handled by a `@QueryHandler`.
- **EventBus** — publish domain `Event`s handled by `@EventHandler`(s), often emitted from aggregates after a command commits.

```ts
export class CreateOrderCommand {
  constructor(public readonly userId: string, public readonly items: Item[]) {}
}

@CommandHandler(CreateOrderCommand)
export class CreateOrderHandler implements ICommandHandler<CreateOrderCommand> {
  constructor(
    private readonly repo: OrderRepository,
    private readonly publisher: EventPublisher,
  ) {}

  async execute(cmd: CreateOrderCommand) {
    const order = this.publisher.mergeObjectContext(
      Order.create(cmd.userId, cmd.items),   // aggregate raises OrderCreatedEvent
    );
    await this.repo.save(order);
    order.commit();                          // flush buffered domain events to EventBus
    return order.id;
  }
}

// controller
@Post() create(@Body() dto: CreateOrderDto) {
  return this.commandBus.execute(new CreateOrderCommand(dto.userId, dto.items));
}
```

**Tip:** CQRS shines when read and write models diverge or when you want an event-driven domain (DDD aggregates raising events). `mergeObjectContext` + `commit()` is how an aggregate's buffered domain events reach the EventBus. For a CRUD app it's over-engineering — be ready to say _why_ it fit CineBite (rich domain, audit/event flows) but not every project.

### Q29: What are domain events and how do they flow through the EventBus?

**A:** A domain event represents something that happened in the domain (e.g. `OrderPlacedEvent`). An aggregate extends `AggregateRoot` and calls `this.apply(event)` to buffer events. When the handler calls `order.commit()`, buffered events are published to the `EventBus`, where one or more `@EventsHandler` react (send email, update read model, enqueue a job). This decouples side effects from the core transaction.

**Tip:** Keep event handlers idempotent and side-effect-only. If a handler must do heavy work, have it enqueue a BullMQ job rather than block.

### Q30: What are NestJS lifecycle hooks?

**A:** Hooks let you run code at module/app lifecycle points:

- `onModuleInit()` — after the module's deps are resolved (open connections, warm caches).
- `onApplicationBootstrap()` — after all modules are initialized.
- `onModuleDestroy()` — on teardown of the module.
- `beforeApplicationShutdown(signal)` / `onApplicationShutdown(signal)` — on app shutdown (close connections, drain queues).

```ts
@Injectable()
export class RedisService implements OnModuleInit, OnApplicationShutdown {
  private client: Redis;
  onModuleInit() {
    this.client = new Redis(process.env.REDIS_URL);
  }
  async onApplicationShutdown() {
    await this.client.quit();
  }
}
```

**Tip:** Shutdown hooks only fire if you call `app.enableShutdownHooks()` in `main.ts`. Essential for graceful shutdown in Kubernetes (drain BullMQ workers, close DB pools on SIGTERM).

### Q31: How do you implement multi-tenancy in NestJS (like the Pharmacy FEFO app)?

**A:** Two common approaches:

1. **Request-scoped tenant context** — a `Scope.REQUEST` provider reads the tenant id from a header/subdomain/JWT and exposes it; services inject it and scope queries by `tenantId`.
2. **Prisma client extensions (`$extends`)** — wrap the Prisma client so every query is automatically filtered/augmented by the current tenant, so individual services don't repeat `where: { tenantId }`.

```ts
function tenantPrisma(base: PrismaClient, tenantId: string) {
  return base.$extends({
    query: {
      $allModels: {
        async findMany({ args, query }) {
          args.where = { ...args.where, tenantId };
          return query(args);
        },
        async create({ args, query }) {
          args.data = { ...args.data, tenantId };
          return query(args);
        },
      },
    },
  });
}
```

Combine with a request-scoped factory that builds the extended client per request using the tenant from the request context.

**Tip:** Alternatives: schema-per-tenant or database-per-tenant (stronger isolation, more ops overhead) vs. shared schema with `tenantId` column (simplest, used here). The Prisma-extension approach centralizes the tenant filter so a developer can't _forget_ it — a security win for FEFO inventory data.

### Q32: How does FEFO logic relate to your Nest/Prisma data layer?

**A:** FEFO (First-Expired-First-Out) means dispensing the batch with the nearest expiry date first. In the data layer this is an `orderBy: { expiryDate: 'asc' }` on in-stock, non-expired batches, wrapped in a transaction that decrements quantities and records the dispense. Putting this in a domain service (not the controller) keeps it testable and reusable across REST endpoints and background reconciliation jobs.

**Tip:** Use `prisma.$transaction` (interactive transactions) so reading the eligible batch and decrementing stock are atomic — prevents over-dispensing under concurrency. Combine with row locking or optimistic concurrency for high-contention SKUs.

### Q33: How do you integrate BullMQ for background jobs?

**A:** Use `@nestjs/bullmq`. Configure the connection with `BullModule.forRoot({ connection: { host, port } })`, register a queue per feature with `BullModule.registerQueue({ name })`, inject the queue to add jobs, and define a `@Processor` with `@Process`/`WorkerHost` to consume them.

```ts
@Injectable()
export class NotificationsService {
  constructor(@InjectQueue("emails") private queue: Queue) {}
  async sendWelcome(userId: string) {
    await this.queue.add("welcome", { userId }, { attempts: 3, backoff: 5000 });
  }
}

@Processor("emails")
export class EmailProcessor extends WorkerHost {
  async process(job: Job) {
    if (job.name === "welcome") {
      /* send email */
    }
  }
}
```

**Tip:** BullMQ uses Redis. Set `attempts` + `backoff` for retries and `removeOnComplete`/`removeOnFail` to bound Redis memory. Run processors in a separate worker process for scale; ensure they shut down gracefully via lifecycle hooks.

### Q34: How do you add caching with CacheModule?

**A:** Import `CacheModule.register({ isGlobal, ttl, store })` (in-memory by default, or `cache-manager-redis-yet`/`keyv` for Redis). Use `@UseInterceptors(CacheInterceptor)` to auto-cache GET responses, or inject `CACHE_MANAGER` for manual `get`/`set`.

```ts
@Injectable()
export class CatalogService {
  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}
  async getCategories() {
    const hit = await this.cache.get("categories");
    if (hit) return hit;
    const data = await this.repo.find();
    await this.cache.set("categories", data, 60_000);
    return data;
  }
}
```

**Tip:** The auto `CacheInterceptor` only caches GET and keys by URL — fine for public, parameterless reads but dangerous for tenant- or user-specific data (cross-tenant leakage). Use manual caching with tenant-scoped keys in multi-tenant apps.

### Q35: How do you schedule tasks with `@nestjs/schedule`?

**A:** Import `ScheduleModule.forRoot()`, then decorate provider methods with `@Cron()`, `@Interval()`, or `@Timeout()`.

```ts
@Injectable()
export class ExpiryJob {
  @Cron("0 2 * * *") // daily at 02:00
  async flagExpiringBatches() {
    /* mark batches near expiry */
  }
}
```

**Tip:** In a multi-instance deployment, naive cron runs on every instance — use a distributed lock (Redis) or run the scheduler in a single dedicated instance to avoid duplicate execution. Great fit for the Pharmacy expiry-sweep job.

### Q36: How do WebSocket gateways work (briefly)?

**A:** A gateway is a class decorated with `@WebSocketGateway()` that handles real-time events. `@SubscribeMessage('event')` methods handle inbound messages; `@WebSocketServer()` injects the server to emit. It supports Socket.IO (default) or native WS, and the same guards/pipes/interceptors apply.

```ts
@WebSocketGateway({ cors: true })
export class OrdersGateway {
  @WebSocketServer() server: Server;
  @SubscribeMessage("joinRoom")
  join(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
    client.join(room);
  }
  notify(room: string, payload: any) {
    this.server.to(room).emit("update", payload);
  }
}
```

**Tip:** Lifecycle hooks `OnGatewayConnection`/`OnGatewayDisconnect` handle connect/disconnect. Auth over WS is done in a guard on the handshake or `handleConnection`.

### Q37: How do NestJS microservices work (briefly)?

**A:** Nest abstracts a **transport layer** (TCP, Redis, NATS, Kafka, RabbitMQ, gRPC). A microservice app is created with `NestFactory.createMicroservice`. Handlers use `@MessagePattern('cmd')` for request/response and `@EventPattern('event')` for fire-and-forget events. Clients use `ClientProxy.send()` (returns Observable) or `.emit()`.

**Tip:** `send()` is request/response (awaits a reply); `emit()` is event-based (no reply). Choose the transport based on need: Kafka/RabbitMQ for durable events, gRPC for typed RPC, Redis for pub/sub.

### Q38: How do you add Swagger/OpenAPI documentation?

**A:** Use `@nestjs/swagger`. Build the document in `main.ts` and decorate DTOs/controllers.

```ts
const config = new DocumentBuilder()
  .setTitle("Pharmacy API")
  .setVersion("1.0")
  .addBearerAuth()
  .build();
SwaggerModule.setup("docs", app, SwaggerModule.createDocument(app, config));

export class CreateProductDto {
  @ApiProperty({ example: "Paracetamol" }) @IsString() name: string;
  @ApiPropertyOptional() @IsOptional() @IsString() description?: string;
}
```

Decorators: `@ApiTags`, `@ApiOperation`, `@ApiResponse`, `@ApiBearerAuth`, `@ApiProperty`.

**Tip:** Enable the Swagger CLI plugin (`nest-cli.json`) so `@ApiProperty` is inferred from DTO types automatically, cutting boilerplate. `addBearerAuth()` + `@ApiBearerAuth()` add the JWT auth field to the UI.

### Q39: How do you unit-test a service in NestJS?

**A:** Use `Test.createTestingModule` to build a testing module, providing mocks for dependencies, then `module.get(Token)` to retrieve the instance.

```ts
describe("ProductsService", () => {
  let service: ProductsService;
  const repo = { find: jest.fn(), findOne: jest.fn() };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: getRepositoryToken(Product), useValue: repo },
      ],
    }).compile();
    service = module.get(ProductsService);
  });

  it("returns all products", async () => {
    repo.find.mockResolvedValue([{ id: "1" }]);
    expect(await service.findAll()).toHaveLength(1);
  });
});
```

**Tip:** `overrideProvider(Token).useValue(mock)` lets you swap a real provider in an otherwise complete module. For e2e tests use `supertest` against `app.getHttpServer()`.

### Q40: How do you mock a guard or a request-scoped provider in tests?

**A:** Override the guard with `overrideGuard(JwtAuthGuard).useValue({ canActivate: () => true })` in e2e tests. For request-scoped providers, resolve them with `await module.resolve(Token)` (not `get`, since each request has its own instance) and pass a `contextId` if you need the same instance across resolves.

**Tip:** `module.get()` works for singletons; `module.resolve()` is required for request/transient-scoped providers.

### Q41: What is `ClassSerializerInterceptor` and how does it control output?

**A:** It applies class-transformer rules to the returned entity/DTO: `@Exclude()` hides a property (e.g. `passwordHash`), `@Expose()` reveals/renames, and `@Transform()` reshapes. Enable globally or per-route, and return class instances (not plain objects) so transformation applies.

**Tip:** It only transforms class instances — returning a raw Prisma object (plain JS object) won't trigger `@Exclude`. Wrap results in a response entity class, or use `plainToInstance`.

### Q42: How do execution contexts work across HTTP, RPC, and WS?

**A:** Guards/interceptors/filters receive an `ExecutionContext` (or `ArgumentsHost`) that's protocol-agnostic. You narrow it with `host.switchToHttp()`, `switchToRpc()`, or `switchToWs()` to get the appropriate request/response objects. This is why the same guard can protect HTTP routes, microservice handlers, and gateways.

**Tip:** `ExecutionContext` extends `ArgumentsHost` and adds `getHandler()`/`getClass()` for metadata reflection — that's what `Reflector` reads.

### Q43: How do you order multiple guards, interceptors, and pipes?

**A:** Within the same level, they run in array order. Across levels the precedence is global → controller → method for guards and interceptors (pre-phase), and the reverse for the interceptor post-phase (it unwinds). Pipes apply at the parameter where declared. Global ones registered via `app.useGlobalX` can't inject dependencies; to inject deps into a global guard/interceptor/filter, register it as a provider with the `APP_GUARD`/`APP_INTERCEPTOR`/`APP_FILTER` token.

**Tip:** Use the `APP_GUARD` provider token (in a module's `providers`) when your global guard needs DI (e.g. a `Reflector` or `ConfigService`) — `app.useGlobalGuards(new X())` instantiates outside the DI container.

### Q44: What's the difference between `forRoot`/`forRootAsync` and `registerAsync`?

**A:** Naming is convention, not enforced. `forRoot` configures a module once at the root (shared/global singletons, e.g. DB or config). `register`/`registerAsync` configures a non-global instance per feature module (e.g. a specific Bull queue or HTTP client). The `*Async` variants resolve options via `useFactory`/`useExisting`/`useClass`, enabling injection of `ConfigService`.

**Tip:** If you call a `register`-style method in two modules, you get two configured instances; calling `forRoot` twice is usually a bug.

## Common Mistakes / Red Flags

- **"Nest can't resolve dependencies of X"** — almost always a missing `exports` in the providing module, a missing `imports` in the consumer, or a forgotten `@Injectable()`. (Or a circular dependency — use `forwardRef()`.)
- **Forgetting the global `ValidationPipe`** — DTOs with class-validator decorators do nothing without it. Also forgetting `transform: true` means query/param "numbers" stay strings.
- **Using `interface` for DTOs** — erased at runtime, so validation and Swagger break. Use classes.
- **Injecting `@Res()` then wondering why interceptors don't transform the response** — manual response handling opts out of Nest's pipeline (unless `{ passthrough: true }`).
- **Request scope contagion** — depending on a `Scope.REQUEST` provider makes the whole chain request-scoped, instantiated per request; surprising performance hit if done unintentionally.
- **Putting business logic / DB calls in controllers** — breaks testability and reuse; keep controllers thin.
- **Cross-tenant cache/data leaks** — auto `CacheInterceptor` keys by URL only; multi-tenant apps must namespace cache keys and centralize the `tenantId` filter (Prisma extension) so it can't be forgotten.
- **`synchronize: true` in production (TypeORM)** — can drop/alter columns and destroy data; use migrations.
- **Returning raw Prisma/ORM objects expecting `@Exclude()` to work** — class-transformer only applies to class instances.
- **Global guards/interceptors needing DI registered via `app.useGlobalX(new ...())`** — they won't get injected deps; use the `APP_GUARD`/`APP_INTERCEPTOR` provider tokens instead.
- **Cron jobs duplicated across replicas** — `@Cron` fires on every instance; use a distributed lock or single scheduler instance.
- **No graceful shutdown** — forgetting `enableShutdownHooks()` leaves DB pools and BullMQ workers dangling on SIGTERM.
- **Over-applying CQRS/DDD** — using CommandBus/EventBus for a simple CRUD app adds ceremony with no payoff; justify it by domain complexity (as in CineBite), not novelty.
- **Magic-string injection tokens** — collisions and typos; use exported symbol/const tokens.
- **Returning `false` from a guard for auth failures** — yields a generic 403; throw specific exceptions (`UnauthorizedException`) for clearer responses.

## Further Reading

- NestJS Fundamentals — Modules, Providers & Dependency Injection: https://docs.nestjs.com/modules
- Request Lifecycle (guards, interceptors, pipes, filters order): https://docs.nestjs.com/faq/request-lifecycle
- CQRS module: https://docs.nestjs.com/recipes/cqrs
- Custom & dynamic providers / injection scopes: https://docs.nestjs.com/fundamentals/injection-scopes
