import type { DHttpRequestDoc } from '@/utility/model';
import axios from 'axios';
import { toRaw } from 'vue'

/**
 * 通过调用后端 API 生成 API 文档。
 * 此函数是异步的 (ASYNC)。
 *
 * @param requestDoc 要发送到后端的请求对象数据 (DHttpRequestDoc 类型)。
 * @returns 一个 Promise，resolve 时返回生成的文档内容的字符串 (例如 HTML)，reject 时返回一个 Error 对象。
 */
export const docegen = async (requestDoc: DHttpRequestDoc): Promise<string | Error> => {
  console.log('docegen: 正在调用后端 API 生成文档...');

  // *** 定义后端 API 的完整 URL ***
  const backendUrl = "http://localhost:3001/api/generate-docs"; // <<< 指向文档生成 API

  // 构建请求体，包含请求描述和所需的格式
  const reqBody = {
    requestDesc: toRaw(requestDoc),
    format: 'markdown'
  };

  console.log(reqBody)
  try {
    // 将请求体发送到后端
    const response = await axios.post(backendUrl, reqBody);

    // 检查后端响应状态码 (通常 2xx 表示成功)
    if (response.status >= 200 && response.status < 300) {
      console.log('docegen: 后端响应成功接收.');
      const responseData = response.data; // 获取完整的响应体

      // *** 处理新的成功响应格式 { "success": true, "data": { "format": "...", "content": "..." } } ***
      // 检查 success 标志和 data 结构，并确认 content 是字符串
      if (responseData && responseData.success === true &&
        responseData.data && typeof responseData.data.content === 'string') {
        console.log('docegen: 从后端接收到生成的文档内容.');
        return responseData.data.content; // *** 成功时，返回生成的文档内容字符串 ***
      } else {
        // 后端返回成功状态码，但业务逻辑失败 (success: false) 或数据格式异常
        console.error('docegen: 后端返回成功状态，但数据格式异常或 success 为 false:', responseData);
        // 尝试从后端错误响应中提取信息，或使用通用错误消息
        const errorMessage = responseData && (responseData.error || responseData.details) ?
          (responseData.error + (responseData.details ? ` (${responseData.details})` : '')) :
          '未知错误或后端指示文档生成失败';
        // *** 返回一个 Error 对象表示失败 ***
        return new Error(`文档生成失败: ${errorMessage}. 响应: ${JSON.stringify(responseData)}`);
      }
    } else {
      // 理论上 axios 对非 2xx 状态码会抛出错误，所以这个 else 分支不一定能走到
      // 但作为备用处理，如果 axios 配置了不抛异常，可以在此处理非 2xx 响应
      console.error('docegen: 后端返回非 2xx 状态码:', response.status, response.data);
      const errorData = response.data;
      // 尝试从后端错误响应中提取信息
      const errorMessage = errorData && (errorData.error || errorData.details) ?
        (errorData.error + (errorData.details ? ` (${errorData.details})` : '')) :
        `未知错误 (状态码: ${response.status})`;
      // *** 返回一个 Error 对象表示失败 ***
      return new Error(`文档生成失败 (后端错误 ${response.status}): ${errorMessage}`);
    }

  } catch (error) {
    // *** 捕获 axios 请求过程中发生的错误 (网络错误, 非 2xx 状态码导致的 axios 抛错等) ***
    console.error('docegen: 调用后端 API 失败:', error);
    let errorMessage = '文档生成请求失败.';

    if (axios.isAxiosError(error)) {
      // Axios 错误处理
      if (error.response) {
        // 后端有响应，但状态码是错误 (非 2xx)
        console.error('docegen: 错误响应数据:', error.response.data);
        const errorData = error.response.data;
        // 尝试从后端错误响应中提取错误信息
        errorMessage = `文档生成失败 (后端错误 ${error.response.status}): ${
          errorData && (errorData.error || errorData.details) ?
            (errorData.error + (errorData.details ? ` (${errorData.details})` : '')) :
            error.message || '未知后端错误'
        }`;
      } else if (error.request) {
        // 请求发出去了，但没有收到响应 (很可能是网络问题或后端未运行)
        console.error('docegen: 错误请求:', error.request);
        errorMessage = `文档生成失败 (网络错误): ${error.message || '无法连接到后端服务.'}`;
      } else {
        // Something else happened while setting up the request
        errorMessage = `文档生成失败 (请求错误): ${error.message}`;
      }
    } else {
      // 非 Axios 错误
      errorMessage = `文档生成失败 (未知错误): ${String(error)}`;
    }
    // *** 返回一个 Error 对象表示失败 ***
    return new Error(errorMessage);
  }
};
