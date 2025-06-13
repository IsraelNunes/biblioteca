import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeitorDashboardComponent } from './leitor-dashboard/leitor-dashboard.component';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    LeitorDashboardComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class LeitorModule { }
