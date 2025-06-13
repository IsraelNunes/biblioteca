import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (this.loginForm.valid) {
      console.log('LoginComponent: Formulário de login válido. Chamando AuthService.login...');

      this.authService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log('LoginComponent: Resposta do AuthService.login:', response);
          console.log('LoginComponent: Token armazenado?', this.authService.getToken() ? 'Sim' : 'Não');
          const userPerfil = this.authService.getPerfil();
          console.log('LoginComponent: Perfil obtido do AuthService:', userPerfil);

          if (userPerfil === 'bibliotecario') {
            console.log('LoginComponent: Redirecionando para /bibliotecario...');
            this.router.navigate(['/bibliotecario']);
          } else if (userPerfil === 'leitor') {
            console.log('LoginComponent: Redirecionando para /leitor...');
            this.router.navigate(['/leitor']);
          } else {
            this.errorMessage = 'Perfil de usuário desconhecido. Por favor, contate o suporte.';
            this.authService.logout();
            console.error('LoginComponent: Erro: Perfil desconhecido ou ausente na resposta.');
          }
        },
        error: (error) => {
          console.error('LoginComponent: Erro na requisição de login:', error);
          this.errorMessage = error.error?.message || 'Falha no login. Verifique suas credenciais.';
        },
        complete: () => {
          console.log('LoginComponent: Requisição de login COMPLETA.');
        }
      });

    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      console.log('LoginComponent: Formulário de login inválido.');
    }
  }
}