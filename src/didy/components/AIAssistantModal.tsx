import React, { useState } from 'react';
import { didyAudio } from '../audio/didyAudio';
import { HelpCircle, Sparkles, MessageSquare, X, Send, Bot } from 'lucide-react';

interface AIAssistantModalProps {
  onClose: () => void;
}

const PRESET_FAQS = [
  {
    q: 'How do I win the DIDY CUP?',
    a: 'In Drop Mode, descend from the sky, land in The Park, and collect golden DIDY Medals, Energy Sodas, and Golden Discs. High-five teammates and reach the target score before time expires to win the golden DIDY CUP!'
  },
  {
    q: 'How does Drop Mode work?',
    a: 'Drop Mode features 2/2 and 4/4 squad configurations! You spawn high in the clouds with your glider. Use the left joystick to glide toward high-value landing zones like the Park House roof or Jump Pads!'
  },
  {
    q: 'What do Jump Pads do?',
    a: 'The red and yellow trampoline pads launch your character high into the sky! Look up to grab floating high-value Golden Discs and air-glide to secret rooftops.'
  },
  {
    q: 'How do Animal Companions help?',
    a: 'Your pets (Buster the Dog, Whiskers the Cat, etc.) run beside you, alert you to nearby medals, and perform joyous celebration dances when you lift the DIDY CUP!'
  },
  {
    q: 'Where does my player name appear?',
    a: 'Your name (default: "Mouha muh") appears above your 3D character in gameplay, on the real-time scoreboard, on the match results screen, and on the DIDY CUP victory podium! You can change it anytime in Profile.'
  }
];

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Hey Mouha muh! I'm Eileen, your Park AI Assistant. Ask me anything about Drop Mode, jump pads, controls, or character abilities!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputText;
    if (!textToSend.trim()) return;

    didyAudio.playButtonClick();
    const newMsgs = [...messages, { sender: 'user' as const, text: textToSend }];
    setMessages(newMsgs);
    setInputText('');
    setIsThinking(true);

    // Contextual answer lookup with fallback
    setTimeout(() => {
      let reply = "The Park is full of secrets! Jump on the trampoline pads near the yellow house, collect Energy Sodas for speed bursts, and work with your squad to claim the DIDY CUP!";
      const lower = textToSend.toLowerCase();
      if (lower.includes('drop') || lower.includes('sky')) {
        reply = "In Drop Mode (2/2 or 4/4), steer your glider with the joystick. Aim for the high-yield center courtyard or the dock!";
      } else if (lower.includes('character') || lower.includes('mordecai') || lower.includes('rigby')) {
        reply = "Mordecai has high leap power, Rigby has fast scamper speed, and Skips has massive strength! Test their unique emotes in the Character menu.";
      } else if (lower.includes('trophy') || lower.includes('didy cup') || lower.includes('win')) {
        reply = "Winning the match triggers the golden DIDY CUP cinematic celebration with confetti and your equipped pet dancing beside you!";
      } else if (lower.includes('control') || lower.includes('joystick') || lower.includes('button')) {
        reply = "You can customize button sizes, positions, and transparency in Settings -> Controls -> Touch HUD Layout Editor.";
      }

      setMessages([...newMsgs, { sender: 'ai' as const, text: reply }]);
      setIsThinking(false);
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none font-sans">
      <div className="bg-[#0b1320] border-2 border-white/15 rounded-3xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-display font-black text-white tracking-wider flex items-center gap-1.5">
                PARK AI ASSISTANT
              </h2>
              <p className="text-xs font-mono text-cyan-300">
                Gameplay tips, lore, and match strategies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preset FAQ Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-mono">
          {PRESET_FAQS.map((faq, i) => (
            <button
              key={i}
              onClick={() => handleSend(faq.q)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-white/10 whitespace-nowrap transition-colors cursor-pointer"
            >
              {faq.q}
            </button>
          ))}
        </div>

        {/* Message Thread */}
        <div className="flex-1 bg-slate-950/60 border border-white/10 rounded-2xl p-4 overflow-y-auto flex flex-col gap-3 min-h-[220px]">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
            >
              <div
                className={`p-3 rounded-2xl text-xs leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-cyan-500 text-slate-950 font-bold rounded-tr-xs'
                    : 'bg-slate-900 text-slate-200 border border-white/10 rounded-tl-xs'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="text-xs font-mono text-indigo-400 animate-pulse flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Eileen is thinking...
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="text"
            placeholder="Ask about Drop Mode, jump pads, characters..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white focus:outline-hidden focus:border-cyan-400"
          />
          <button
            onClick={() => handleSend()}
            className="p-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
