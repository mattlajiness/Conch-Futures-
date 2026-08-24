import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence for render-time exceptions.
 *
 * Without this, a single unexpected shape in Firestore data — a malformed
 * `selections` map, an unexpected `results` value from an admin edit — throws
 * during render and React unmounts the whole tree, leaving a blank white page
 * with no way back other than the user guessing to reload.
 */
export default class ErrorBoundary extends React.Component<Props, State> {
  // Declared explicitly because @types/react is not installed in this project,
  // so the inherited members of React.Component aren't visible to tsc.
  declare props: Props;
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-[#061217] flex flex-col justify-center items-center px-6 text-center">
        <h1 className="text-white font-extrabold text-xl mb-2">
          Something went wrong
        </h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          The app hit an unexpected error. Reloading usually fixes it — your
          saved picks are stored on the server, not in this page.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer text-sm"
        >
          Reload the page
        </button>
        <p className="text-slate-600 font-mono text-[10px] mt-6 max-w-md break-words">
          {this.state.error.message}
        </p>
      </div>
    );
  }
}
