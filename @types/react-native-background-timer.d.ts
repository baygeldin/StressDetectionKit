declare module 'react-native-background-timer' {
  class BackgroundTimer {
    setInterval(
      callback: (...args: any[]) => void,
      ms: number,
      ...args: any[]
    ): NodeJS.Timer;
    clearInterval(intervalId: NodeJS.Timer): void;
    setTimeout(
      callback: (...args: any[]) => void,
      ms: number,
      ...args: any[]
    ): NodeJS.Timer;
    clearTimeout(intervalId: NodeJS.Timer): void;
  }

  const instance: BackgroundTimer;

  export default instance;
}
