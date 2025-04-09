'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { RiBookMarkLine, RiFileList3Line, RiMore2Fill, RiEdit2Line, RiDeleteBinLine, RiAddLine, RiTimeLine } from 'react-icons/ri';

interface Subject {
  id: string;
  name: string;
  progress: number;
  topicsCount: number;
  nextReview: string;
  description?: string;
}

interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  lastReviewed?: Date;
  nextReview?: Date;
  difficulty: 'easy' | 'medium' | 'hard';
}

// Componente StatCard movido para antes do seu uso
function StatCard({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg hover:border-primary/30 transition-all group">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        <div>
          <p className="text-foreground/60 text-sm">{title}</p>
          <p className="text-2xl font-bold text-foreground/90">{value}</p>
        </div>
      </div>
    </div>
  );
}

export default function StudyPage() {
  // Estados principais
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [totalStudyTime, setTotalStudyTime] = useState<string>("0h");

  // Estados para modais
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState<string | null>(null);
  const [isFlashcardModalOpen, setIsFlashcardModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectToDelete, setSubjectToDelete] = useState<string | null>(null);
  
  // Form states para matéria
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  // Form states para flashcard
  const [formQuestion, setFormQuestion] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formDifficulty, setFormDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formSubjectId, setFormSubjectId] = useState<string>('');

  // Contadores para estatísticas
  const calculateNextReview = () => {
    if (subjects.length === 0) return "Nenhuma";
    
    const today = new Date();
    const nearestSubjects = subjects
      .filter(subject => {
        if (subject.nextReview === "Hoje") return true;
        if (subject.nextReview === "Amanhã") return true;
        const days = parseInt(subject.nextReview.split(" ")[0]);
        return !isNaN(days) && days <= 3; // próximos 3 dias
      })
      .sort((a, b) => {
        if (a.nextReview === "Hoje") return -1;
        if (b.nextReview === "Hoje") return 1;
        if (a.nextReview === "Amanhã") return -1;
        if (b.nextReview === "Amanhã") return 1;
        return parseInt(a.nextReview.split(" ")[0]) - parseInt(b.nextReview.split(" ")[0]);
      });
      
    return nearestSubjects.length > 0 ? nearestSubjects[0].nextReview : "Nenhuma";
  };

  // Funções para gerenciar matérias
  const openSubjectModal = (subject?: Subject) => {
    if (subject) {
      setSelectedSubject(subject);
      setFormName(subject.name);
      setFormDescription(subject.description || '');
    } else {
      setSelectedSubject(null);
      setFormName('');
      setFormDescription('');
    }
    setIsSubjectModalOpen(true);
  };

  const closeSubjectModal = () => {
    setIsSubjectModalOpen(false);
    setSelectedSubject(null);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    
    const subjectData: Omit<Subject, 'id' | 'progress' | 'topicsCount' | 'nextReview'> = {
      name: formName,
      description: formDescription || undefined,
    };

    if (selectedSubject) {
      // Atualizar matéria existente
      setSubjects(subjects.map(subject => 
        subject.id === selectedSubject.id 
          ? { 
              ...subject, 
              name: subjectData.name, 
              description: subjectData.description 
            } 
          : subject
      ));
    } else {
      // Criar nova matéria
      const randomDays = Math.floor(Math.random() * 5) + 1;
      const nextReview = randomDays === 1 ? "Hoje" : 
                        randomDays === 2 ? "Amanhã" : 
                        `${randomDays} dias`;
      
      const newSubject: Subject = {
        ...subjectData,
        id: Date.now().toString(),
        progress: 0,
        topicsCount: 0,
        nextReview: nextReview
      };
      setSubjects([...subjects, newSubject]);
    }

    closeSubjectModal();
  };

  const openDeleteModal = (id: string) => {
    setSubjectToDelete(id);
    setIsDeleteModalOpen(true);
    setIsMenuOpen(null);
  };

  const handleDeleteSubject = () => {
    if (subjectToDelete) {
      setSubjects(subjects.filter(subject => subject.id !== subjectToDelete));
      // Remover flashcards associados à matéria
      setFlashcards(flashcards.filter(flashcard => flashcard.subjectId !== subjectToDelete));
      setIsDeleteModalOpen(false);
      setSubjectToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSubjectToDelete(null);
  };

  const toggleMenu = (id: string) => {
    setIsMenuOpen(isMenuOpen === id ? null : id);
  };

  // Funções para gerenciar flashcards
  const openFlashcardModal = (subjectId: string) => {
    setFormSubjectId(subjectId);
    setFormQuestion('');
    setFormAnswer('');
    setFormDifficulty('medium');
    setIsFlashcardModalOpen(true);
    setIsMenuOpen(null);
  };

  const closeFlashcardModal = () => {
    setIsFlashcardModalOpen(false);
  };

  const handleSaveFlashcard = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newFlashcard: Flashcard = {
      id: Date.now().toString(),
      subjectId: formSubjectId,
      question: formQuestion,
      answer: formAnswer,
      difficulty: formDifficulty,
      lastReviewed: new Date(),
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000) // Próxima revisão em 1 dia
    };
    
    setFlashcards([...flashcards, newFlashcard]);
    
    // Atualizar contagem de tópicos da matéria
    setSubjects(subjects.map(subject => 
      subject.id === formSubjectId 
        ? { ...subject, topicsCount: subject.topicsCount + 1 } 
        : subject
    ));
    
    closeFlashcardModal();
  };

  // Simular tempo de estudo total
  useEffect(() => {
    const totalHours = Math.floor(Math.random() * 30) + 1;
    setTotalStudyTime(`${totalHours}h`);
  }, []);

  return (
    <MainLayout>
      <div className="min-h-screen bg-background relative overflow-hidden">
        {/* Elementos decorativos espaciais */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-20 left-1/4 w-2 h-2 bg-primary rounded-full animate-twinkle" />
          <div className="absolute top-40 right-1/3 w-1 h-1 bg-primary rounded-full animate-twinkle delay-100" />
          <div className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-primary rounded-full animate-twinkle delay-200" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cabeçalho */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
                Estudos
              </h1>
              <p className="text-foreground/60 mt-1">
                Gerencie seu aprendizado de forma eficiente
              </p>
            </div>
            <button 
              onClick={() => openSubjectModal()}
              className="group relative px-4 py-2 bg-primary/80 hover:bg-primary text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Nova Matéria</span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/30 to-accent/30 opacity-0 group-hover:opacity-100 transition-opacity blur-lg -z-10" />
            </button>
          </div>
          
          {/* Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <StatCard 
              title="Matérias" 
              value={subjects.length.toString()} 
              icon={<RiBookMarkLine className="w-6 h-6" />}
            />
            <StatCard 
              title="Flashcards" 
              value={flashcards.length.toString()} 
              icon={<RiFileList3Line className="w-6 h-6" />}
            />
            <StatCard 
              title="Tempo Estudado" 
              value={totalStudyTime} 
              icon={<RiTimeLine className="w-6 h-6" />}
            />
            <StatCard 
              title="Próxima Revisão" 
              value={calculateNextReview()} 
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v9l6 3"></path>
                  <circle cx="12" cy="12" r="10"></circle>
                </svg>
              }
            />
          </div>
          
          {/* Lista de Matérias */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-semibold mb-6">Suas Matérias</h2>
            
            {subjects.length > 0 ? (
              <div className="divide-y divide-white/10">
                {subjects.map(subject => (
                  <div key={subject.id} className="py-4 hover:bg-white/5 transition-all rounded-xl px-4 -mx-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-foreground/90">{subject.name}</h3>
                        <p className="text-sm text-foreground/60">
                          {subject.topicsCount} tópicos • Próxima revisão: {subject.nextReview}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-sm font-medium text-foreground/90">{subject.progress}%</span>
                          <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full" 
                              style={{ width: `${subject.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="relative">
                          <button 
                            className="p-2 text-foreground/60 hover:text-primary transition-colors rounded-xl hover:bg-primary/10"
                            onClick={() => toggleMenu(subject.id)}
                            aria-label="Opções da matéria"
                          >
                            <RiMore2Fill className="w-5 h-5" />
                          </button>
                          
                          {isMenuOpen === subject.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-background/95 backdrop-blur-lg border border-white/10 rounded-xl shadow-lg z-10 py-1">
                              <button 
                                onClick={() => openFlashcardModal(subject.id)}
                                className="w-full text-left px-4 py-2 text-sm text-foreground/80 hover:bg-white/10 flex items-center gap-2"
                              >
                                <RiAddLine className="w-4 h-4" />
                                Adicionar Flashcard
                              </button>
                              <button 
                                onClick={() => openSubjectModal(subject)}
                                className="w-full text-left px-4 py-2 text-sm text-foreground/80 hover:bg-white/10 flex items-center gap-2"
                              >
                                <RiEdit2Line className="w-4 h-4" />
                                Editar Matéria
                              </button>
                              <button 
                                onClick={() => openDeleteModal(subject.id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                              >
                                <RiDeleteBinLine className="w-4 h-4" />
                                Excluir Matéria
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-foreground/60">
                  Você não tem nenhuma matéria ainda. Crie uma nova matéria para começar seus estudos!
                </p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-foreground/60">
              Em breve: sistema avançado de repetição espaçada, cronogramas de estudo e mais!
            </p>
          </div>
        </div>

        {/* Modal de Criar/Editar Matéria */}
        {isSubjectModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-xl font-bold text-white">
                  {selectedSubject ? 'Editar Matéria' : 'Nova Matéria'}
                </h3>
              </div>

              <form onSubmit={handleSaveSubject} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Nome da Matéria
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="Ex: Matemática, Programação, Inglês"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Adicione detalhes sobre esta matéria"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeSubjectModal}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20"
                  >
                    {selectedSubject ? 'Atualizar' : 'Criar'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md">
              <div className="p-5 bg-gradient-to-r from-red-500/20 to-red-600/20">
                <h3 className="text-xl font-bold text-white">Confirmar Exclusão</h3>
              </div>

              <div className="p-5">
                <p className="text-foreground/80 mb-6">
                  Tem certeza que deseja excluir esta matéria? Esta ação também excluirá todos os flashcards associados e não pode ser desfeita.
                </p>

                <div className="flex justify-end gap-3">
                  <button
                    onClick={cancelDelete}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteSubject}
                    className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all shadow-lg shadow-red-500/20"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Criar Flashcard */}
        {isFlashcardModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div 
              className="bg-background border border-white/10 rounded-2xl shadow-xl w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-5 bg-gradient-to-r from-primary/10 to-accent/10">
                <h3 className="text-xl font-bold text-white">Novo Flashcard</h3>
              </div>

              <form onSubmit={handleSaveFlashcard} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Pergunta
                  </label>
                  <textarea
                    value={formQuestion}
                    onChange={(e) => setFormQuestion(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Qual a questão que deseja lembrar?"
                    rows={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Resposta
                  </label>
                  <textarea
                    value={formAnswer}
                    onChange={(e) => setFormAnswer(e.target.value)}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                    placeholder="Qual a resposta a esta pergunta?"
                    rows={3}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground/80 mb-1">
                    Dificuldade
                  </label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                    className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                  >
                    <option value="easy">Fácil</option>
                    <option value="medium">Média</option>
                    <option value="hard">Difícil</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeFlashcardModal}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-white font-medium transition-all shadow-lg shadow-primary/20"
                  >
                    Criar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
} 