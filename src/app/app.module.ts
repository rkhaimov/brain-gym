import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { AppRoutingModule } from './app-routing.module';
import { ProductService } from './globals/product.service';
import { CartService } from './globals/cart.service';

@NgModule({
  providers: [ProductService, CartService],
  imports: [BrowserModule, AppRoutingModule],
  declarations: [AppComponent, TopBarComponent],
  bootstrap: [AppComponent],
})
export class AppModule {}
