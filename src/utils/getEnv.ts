export default function getEnv(key: string) {
  if (!process.env[key]) {
    throw new Error(`环境变量 ${key} 未设置`);
  } else {
    return process.env[key];
  }
}