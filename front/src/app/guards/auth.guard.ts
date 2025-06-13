import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../auth/auth.service'; 

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredPerfil = route.data['perfil'];

  if (authService.isAuthenticated()) {
    const userPerfil = authService.getPerfil();

    if (requiredPerfil && userPerfil !== requiredPerfil) {
      console.warn(`Acesso negado: Perfil '<span class="math-inline">\{userPerfil\}' não tem permissão para '</span>{requiredPerfil}' em ${state.url}`);
      router.navigate(['/login']);
      return false;
    }
    return true;
  } else {
    console.log('Acesso negado: Usuário não autenticado.');
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } }); 
    return false;
  }
};