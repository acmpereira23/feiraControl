/**
 * Orquestra o módulo de autenticação sem acoplar a aplicação à implementação
 * concreta de segurança.
 *
 * <p>Responsabilidades desta camada:
 *
 * <ul>
 *   <li>expor contratos para contexto autenticado;
 *   <li>definir portas para credenciais e emissão de token;
 *   <li>coordenar casos de uso futuros de login, cadastro e refresh.
 * </ul>
 */
@org.springframework.lang.NonNullApi
package com.feiracontrol.backend.application.auth;
