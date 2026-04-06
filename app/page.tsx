"use client";

import { useState } from "react";

type JobAnalysis = {
  matchPercentage: number;
  missingSkills: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string;
};

export default function Home() {
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysis, setAnalysis] = useState<JobAnalysis | null>(null);
  const [rewrittenResume, setRewrittenResume] = useState<string | null>(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [loadingAnalyze, setLoadingAnalyze] = useState(false);
  const [loadingRewrite, setLoadingRewrite] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setLoadingUpload(true);
    setAnalysis(null);
    setRewrittenResume(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload-resume", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload resume");
      }

      setResumeFileName(file.name);
      setResumeText(data.resumeText);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to upload resume");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleAnalyzeJob = async () => {
    if (!resumeText || !jobDescription.trim()) {
      setErrorMsg("Please upload a resume and paste a job description.");
      return;
    }

    setErrorMsg(null);
    setLoadingAnalyze(true);
    setAnalysis(null);

    try {
      const res = await fetch("/api/analyze-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze job");
      }

      setAnalysis(data.analysis);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to analyze job");
    } finally {
      setLoadingAnalyze(false);
    }
  };

  const handleRewriteResume = async () => {
    if (!resumeText || !jobDescription.trim()) {
      setErrorMsg("Please upload a resume and paste a job description.");
      return;
    }

    setErrorMsg(null);
    setLoadingRewrite(true);
    setRewrittenResume(null);

    try {
      const res = await fetch("/api/rewrite-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to rewrite resume");
      }

      setRewrittenResume(data.rewrittenResume);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to rewrite resume");
    } finally {
      setLoadingRewrite(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-5xl bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl p-8 md:p-10 space-y-8">
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-50">
              JobFit AI
            </h1>
            <p className="text-sm md:text-base text-slate-300 mt-1">
              Upload your resume once, test it against multiple job descriptions,
              and generate tailored versions in seconds.
            </p>
          </div>
          <div className="text-xs uppercase tracking-wide text-slate-400 bg-slate-800/80 border border-slate-700 rounded-full px-4 py-1">
            Day 3/60 • Resume & Job Match
          </div>
        </header>

        {errorMsg && (
          <div className="rounded-lg border border-red-500/60 bg-red-950/40 text-red-200 px-4 py-3 text-sm">
            {errorMsg}
          </div>
        )}

        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              1. Upload Your Resume
            </h2>
            <p className="text-sm text-slate-300">
              Upload a PDF or DOCX version of your resume. We&apos;ll keep it
              loaded so you can test multiple job descriptions without
              re-uploading.
            </p>

            <label className="block">
              <span className="sr-only">Upload resume</span>
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-700 rounded-xl px-4 py-8 cursor-pointer hover:border-indigo-500/80 hover:bg-slate-900/60 transition-all">
                <span className="text-sm font-medium text-slate-100">
                  {resumeFileName
                    ? `Resume loaded: ${resumeFileName}`
                    : "Drop your resume here or click to upload"}
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PDF or DOCX • No data stored
                </span>
              </div>
              <input
                type="file"
                accept=".pdf,.docx"
                className="hidden"
                onChange={handleResumeUpload}
              />
            </label>

            {loadingUpload && (
              <p className="text-xs text-slate-400">Uploading and reading resume…</p>
            )}

            {resumeText && !loadingUpload && (
              <p className="text-xs text-emerald-300">
                ✔ Resume text extracted and ready.
              </p>
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-100">
              2. Paste Job Description
            </h2>
            <p className="text-sm text-slate-300">
              Paste any job description here. You can reuse your uploaded resume
              across multiple postings.
            </p>

            <textarea
              className="w-full h-48 rounded-xl border border-slate-700 bg-slate-900/70 text-sm text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Paste the full job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleAnalyzeJob}
                disabled={loadingAnalyze || !resumeText || !jobDescription.trim()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-indigo-600 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loadingAnalyze ? "Analyzing…" : "Analyze Job Fit"}
              </button>

              <button
                type="button"
                onClick={handleRewriteResume}
                disabled={loadingRewrite || !resumeText || !jobDescription.trim()}
                className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-emerald-600 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loadingRewrite ? "Rewriting…" : "Rewrite My Resume for This Job"}
              </button>
            </div>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">
              3. Job Fit Analysis
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 h-72 overflow-auto text-sm text-slate-200">
              {!analysis && (
                <p className="text-slate-500 text-sm">
                  Run an analysis to see match %, missing skills, strengths, and
                  tailoring suggestions.
                </p>
              )}

              {analysis && (
                <div className="space-y-3">
                  <p className="text-base font-semibold text-indigo-300">
                    Match: {analysis.matchPercentage}%
                  </p>

                  <div>
                    <p className="font-medium text-slate-100 text-sm">
                      Missing Skills:
                    </p>
                    {analysis.missingSkills.length ? (
                      <ul className="list-disc list-inside text-slate-200 text-sm">
                        {analysis.missingSkills.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        No major missing skills detected.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-slate-100 text-sm">
                      Strengths:
                    </p>
                    {analysis.strengths.length ? (
                      <ul className="list-disc list-inside text-slate-200 text-sm">
                        {analysis.strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Run an analysis to see strengths.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-slate-100 text-sm">
                      Weaknesses:
                    </p>
                    {analysis.weaknesses.length ? (
                      <ul className="list-disc list-inside text-slate-200 text-sm">
                        {analysis.weaknesses.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-slate-400 text-sm">
                        Run an analysis to see weaknesses.
                      </p>
                    )}
                  </div>

                  <div>
                    <p className="font-medium text-slate-100 text-sm">
                      Tailoring Suggestions:
                    </p>
                    <p className="text-slate-200 text-sm whitespace-pre-wrap">
                      {analysis.suggestions}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-100">
              4. Tailored Resume (Copy & Paste)
            </h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-4 h-72 overflow-auto text-sm text-slate-200">
              {!rewrittenResume && (
                <p className="text-slate-500 text-sm">
                  Click &quot;Rewrite My Resume for This Job&quot; to generate a
                  tailored version that stays honest but highlights what matters
                  most for this role.
                </p>
              )}

              {rewrittenResume && (
                <pre className="whitespace-pre-wrap text-slate-200 text-sm">
                  {rewrittenResume}
                </pre>
              )}
            </div>
          </div>
        </section>

        <footer className="pt-4 border-t border-slate-800 mt-4 text-xs text-slate-500 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
          <span>Built with Next.js + OpenAI • by Kyle</span>
          <span>JobFit AI — Day 3/60 of my 60‑day build challenge</span>
        </footer>
      </div>
    </main>
  );
}