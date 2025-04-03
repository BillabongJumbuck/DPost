import type { HttpMethod } from '@/utility/model/HttpMethod.ts'

class HttpRequest{
  url: string;
  method: HttpMethod;
  Head:string[];
  Body:string[];
}
