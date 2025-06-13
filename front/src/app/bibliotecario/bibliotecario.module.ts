import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BibliotecarioDashboardComponent } from './bibliotecario-dashboard/bibliotecario-dashboard.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    BibliotecarioDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class BibliotecarioModule { }
