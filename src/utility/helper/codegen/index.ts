import axios from 'axios';
import type { DHttpRequestDoc } from '@/utility/model'
import { toRaw } from 'vue'
// Code Generation is Powered by HTTPSnippet (https://github.com/Kong/httpsnippet)
// If you want to add support for your favorite language/library, please contribute to the HTTPSnippet repo <3
/**
 * An array defining all the code generators and their info
 */
export const CodegenDefinitions = [
  {
    name: 'c-curl',
    lang: 'c',
    mode: 'libcurl',
    caption: 'C - cURL',
  },
  {
    name: 'clojure-clj_http',
    lang: 'clojure',
    mode: 'clj_http',
    caption: 'Clojure - clj-http',
  },
  {
    name: 'csharp-httpclient',
    lang: 'csharp',
    mode: 'httpclient',
    caption: 'C# - HttpClient',
  },
  {
    name: 'csharp-restsharp',
    lang: 'csharp',
    mode: 'restsharp',
    caption: 'C# - RestSharp',
  },
  {
    name: 'go-native',
    lang: 'go',
    mode: 'native',
    caption: 'Go',
  },
  {
    name: 'http-http1.1',
    lang: 'http',
    mode: 'http1.1',
    caption: 'HTTP - HTTP 1.1 Request String',
  },
  {
    name: 'java-asynchttp',
    lang: 'java',
    mode: 'asynchttp',
    caption: 'Java - AsyncHTTPClient',
  },
  {
    name: 'java-nethttp',
    lang: 'java',
    mode: 'nethttp',
    caption: 'Java - java.net.http',
  },
  {
    name: 'java-okhttp',
    lang: 'java',
    mode: 'okhttp',
    caption: 'Java - OkHttp',
  },
  {
    name: 'java-unirest',
    lang: 'java',
    mode: 'unirest',
    caption: 'Java - Unirest',
  },
  {
    name: 'javascript-axios',
    lang: 'javascript',
    mode: 'axios',
    caption: 'JavaScript - Axios',
  },
  {
    name: 'javascript-fetch',
    lang: 'javascript',
    mode: 'fetch',
    caption: 'JavaScript - Fetch',
  },
  {
    name: 'javascript-jquery',
    lang: 'javascript',
    mode: 'jquery',
    caption: 'JavaScript - jQuery',
  },
  {
    name: 'javascript-xhr',
    lang: 'javascript',
    mode: 'xhr',
    caption: 'JavaScript - XMLHttpRequest',
  },
  {
    name: 'kotlin-okhttp',
    lang: 'kotlin',
    mode: 'okhttp',
    caption: 'Kotlin - OkHttp',
  },
  {
    name: 'objc-nsurlsession',
    lang: 'objc',
    mode: 'nsurlsession',
    caption: 'Objective C - NSURLSession',
  },
  {
    name: 'ocaml-cohttp',
    lang: 'ocaml',
    mode: 'cohttp',
    caption: 'OCaml - cohttp',
  },
  {
    name: 'php-curl',
    lang: 'php',
    mode: 'curl',
    caption: 'PHP - cURL',
  },
  {
    name: 'powershell-restmethod',
    lang: 'powershell',
    mode: 'restmethod',
    caption: 'Powershell - Invoke-RestMethod',
  },
  {
    name: 'powershell-webrequest',
    lang: 'powershell',
    mode: 'webrequest',
    caption: 'Powershell - Invoke-WebRequest',
  },
  {
    name: 'python-python3',
    lang: 'python',
    mode: 'python3',
    caption: 'Python - Python 3 Native',
  },
  {
    name: 'python-requests',
    lang: 'python',
    mode: 'requests',
    caption: 'Python - Requests',
  },
  {
    name: 'r-httr',
    lang: 'r',
    mode: 'httr',
    caption: 'R - httr',
  },
  {
    name: 'ruby-native',
    lang: 'ruby',
    mode: 'native',
    caption: 'Ruby - Ruby Native',
  },
  {
    name: 'rust-reqwest',
    lang: 'rust',
    mode: 'reqwest',
    caption: 'Rust - Reqwest',
  },
  {
    name: 'shell-curl',
    lang: 'shell',
    mode: 'curl',
    caption: 'Shell - cURL',
  },
  {
    name: 'shell-httpie',
    lang: 'shell',
    mode: 'httpie',
    caption: 'Shell - HTTPie',
  },
  {
    name: 'shell-wget',
    lang: 'shell',
    mode: 'wget',
    caption: 'Shell - Wget',
  },
  {
    name: 'swift-nsurlsession',
    lang: 'swift',
    mode: 'nsurlsession',
    caption: 'Swift - NSURLSession',
  },
] as const

/**
 * A type which defines all the valid code generators
 */
export type CodegenName = (typeof CodegenDefinitions)[number]['name']

/**
 * 通过调用后端 API 生成代码片段。
 * *** 此函数现在是异步的 (ASYNC)。***
 *
 * @param requestDoc 要发送到后端的请求对象数据 (DHttpRequestDoc 类型)。
 * @param codeType 目标代码类型
 * @returns 一个 Promise，resolve 时返回生成的代码字符串，reject 时返回一个 Error 对象。
 */
export const codegen = async (requestDoc: DHttpRequestDoc, codeType: string): Promise<string | Error> => {
  console.log('codegen: 正在调用后端 API 生成代码...');

  // *** 定义后端 API 的完整 URL ***
  const backendUrl = 'http://localhost:3001/api/generate-client'; // <<< *** 请确保这里的 URL 与你的后端服务地址端口一致 ***

  const reqBody = { requestDesc: requestDoc, techStack: codeType };
  try {
    // 将 DHttpRequestDoc 对象作为请求体发送
    const response = await axios.post(backendUrl, reqBody);

    // 检查后端响应状态码 (通常 2xx 表示成功)
    if (response.status >= 200 && response.status < 300) {
      console.log('codegen: 后端响应成功接收.');
      const responseData = response.data; // 获取完整的响应体

      // *** 修改此处以处理新的响应格式 ***
      // 检查 success 标志和 data 结构
      if (responseData && responseData.success === true &&
        responseData.data && typeof responseData.data.clientCode === 'string') {
        console.log('codegen: 从后端接收到生成的代码.');
        return responseData.data.clientCode; // *** 成功时，返回生成的代码字符串 ***
      } else {
        // 后端返回成功状态码，但数据格式不对或 success 为 false
        console.error('codegen: 后端返回成功状态，但数据格式异常或 success 为 false:', responseData);
        // *** 返回一个 Error 对象表示失败 ***
        const errorMessage = responseData && (responseData.error || responseData.details) ?
          (responseData.error + (responseData.details ? ` (${responseData.details})` : '')) :
          '未知错误或后端指示生成失败';
        return new Error(`代码生成失败: ${errorMessage}. 响应: ${JSON.stringify(responseData)}`);
      }
    } else {
      // 理论上 axios 对非 2xx 状态码会抛出错误，所以这个 else 分支不一定能走到
      // 但作为备用处理，如果 axios 配置了不抛异常，可以在此处理非 2xx 响应
      console.error('codegen: 后端返回非 2xx 状态码:', response.status, response.data);
      const errorData = response.data;
      const errorMessage = errorData && (errorData.error || errorData.details) ?
        (errorData.error + (errorData.details ? ` (${errorData.details})` : '')) :
        `未知错误 (状态码: ${response.status})`;
      // *** 返回一个 Error 对象表示失败 ***
      return new Error(`代码生成失败 (后端错误 ${response.status}): ${errorMessage}`);
    }

  } catch (error) {
    // *** 捕获 axios 请求过程中发生的错误 (网络错误, 非 2xx 状态码导致的 axios 抛错等) ***
    console.error('codegen: 调用后端 API 失败:', error);
    let errorMessage = '代码生成请求失败.';

    if (axios.isAxiosError(error)) {
      // Axios 错误处理
      if (error.response) {
        // 后端有响应，但状态码是错误 (非 2xx)
        console.error('codegen: 错误响应数据:', error.response.data);
        const errorData = error.response.data;
        // 尝试从后端错误响应中提取错误信息
        errorMessage = `代码生成失败 (后端错误 ${error.response.status}): ${
          errorData && (errorData.error || errorData.details) ?
            (errorData.error + (errorData.details ? ` (${errorData.details})` : '')) :
            error.message || '未知后端错误'
        }`;
      } else if (error.request) {
        // 请求发出去了，但没有收到响应 (很可能是网络问题或后端未运行)
        console.error('codegen: 错误请求:', error.request);
        errorMessage = `代码生成失败 (网络错误): ${error.message || '无法连接到后端服务.'}`;
      } else {
        // Something else happened while setting up the request
        errorMessage = `代码生成失败 (请求错误): ${error.message}`;
      }
    } else {
      // 非 Axios 错误
      errorMessage = `代码生成失败 (未知错误): ${String(error)}`;
    }
    // *** 返回一个 Error 对象表示失败 ***
    return new Error(errorMessage);
  }
};
