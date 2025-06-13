import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { BibliotecarioDashboardComponent } from './bibliotecario/bibliotecario-dashboard/bibliotecario-dashboard.component';
import { LeitorDashboardComponent } from './leitor/leitor-dashboard/leitor-dashboard.component'; 
import { authGuard } from './guards/auth.guard'; 

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'bibliotecario',
    component: BibliotecarioDashboardComponent,
    canActivate: [authGuard], 
    data: { perfil: 'bibliotecario' } 
  },
  {
    path: 'leitor',
    component: LeitorDashboardComponent,
    canActivate: [authGuard], 
    data: { perfil: 'leitor' } 
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }