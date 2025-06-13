import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      nome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(6)]],
      perfil: ['leitor', Validators.required]
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (this.registerForm.valid) {
      console.log('RegisterComponent: Formulário de registro válido. Chamando AuthService.register...');

      this.authService.register(this.registerForm.value).subscribe({
        next: (response) => {
          console.log('RegisterComponent: Resposta do AuthService.register:', response);
          this.successMessage = 'Registro bem-sucedido! Redirecionando para o login...';
          console.log('RegisterComponent: Sucesso. Iniciando setTimeout para redirecionar...');
          setTimeout(() => {
            console.log('RegisterComponent: setTimeout concluído. Redirecionando para /login...');
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          console.error('RegisterComponent: Erro na requisição de registro:', error);
          this.errorMessage = error.error?.message || 'Falha no registro. Por favor, tente novamente.';
        },
        complete: () => {
          console.log('RegisterComponent: Requisição de registro COMPLETA.');
        }
      });

    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
      console.log('RegisterComponent: Formulário de registro inválido.');
    }
  }
}