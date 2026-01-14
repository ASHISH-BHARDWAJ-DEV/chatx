
function BorderAnimatedContainer({ children }) {
    return (
      <div className="w-full h-full [background:linear-gradient(45deg,#1a1a1a,theme(colors.gray.800)_50%,#1a1a1a)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.gray.600/.48)_80%,_theme(colors.gray.400)_86%,_theme(colors.gray.200)_90%,_theme(colors.gray.400)_94%,_theme(colors.gray.600/.48))_border-box] rounded-2xl border border-transparent animate-border  flex overflow-hidden">
        {children}
      </div>
    );
  }
  export default BorderAnimatedContainer;
