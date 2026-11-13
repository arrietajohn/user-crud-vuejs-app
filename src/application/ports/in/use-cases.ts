import type { LoginCommand, CreateUserCommand, UpdateUserCommand, DeleteUserCommand } from '../../dto/commands/user-commands';
import type { GetUserQuery, ListUsersQuery } from '../../dto/queries/user-queries';
import type { UserResponse, SessionResponse } from '../../dto/responses/user-responses';
export interface LoginUseCase { login(command: LoginCommand): Promise<SessionResponse> }
export interface SessionUseCase { currentSession(): SessionResponse | null; logout(): void }
export interface CreateUserUseCase { create(command: CreateUserCommand): Promise<UserResponse> }
export interface ListUsersUseCase { list(query?: ListUsersQuery): Promise<UserResponse[]> }
export interface GetUserUseCase { get(query: GetUserQuery): Promise<UserResponse> }
export interface UpdateUserUseCase { update(command: UpdateUserCommand): Promise<UserResponse> }
export interface DeleteUserUseCase { delete(command: DeleteUserCommand): Promise<void> }
export type UseCases = LoginUseCase & SessionUseCase & CreateUserUseCase & ListUsersUseCase & GetUserUseCase & UpdateUserUseCase & DeleteUserUseCase;
