import { Component } from '@angular/core';
import { SimpleStorage } from './components/simple-storage/simple-storage';

@Component({
  selector: 'app-root',
  imports: [SimpleStorage],
  template: `<app-simple-storage />`,
})
export class App {
}
