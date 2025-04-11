'use client';

import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';

export default function PrivacyPolicyPage() {
  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Política de Privacidade
          </h1>
          <p className="text-foreground/80">
            Última atualização: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </motion.div>

        <div className="space-y-8 text-foreground/80">
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">1. Introdução</h2>
            <p>
              Bem-vindo à Política de Privacidade do Synapsy. Respeitamos sua privacidade e estamos comprometidos em proteger seus dados pessoais. Esta política de privacidade informará como cuidamos dos seus dados pessoais quando você visita nosso site e aplicativo (independentemente de onde você o visite) e informa sobre seus direitos de privacidade e como a lei protege você.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">2. Os Dados que Coletamos</h2>
            <p>
              Dados pessoais significam qualquer informação sobre um indivíduo a partir da qual essa pessoa possa ser identificada. Não inclui dados onde a identidade foi removida (dados anônimos).
            </p>
            <p>
              Podemos coletar, usar, armazenar e transferir diferentes tipos de dados pessoais sobre você, que agrupamos da seguinte forma:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <span className="font-medium">Dados de Identidade:</span> inclui nome, sobrenome, nome de usuário ou identificador similar, data de nascimento.
              </li>
              <li>
                <span className="font-medium">Dados de Contato:</span> inclui endereço de e-mail e números de telefone.
              </li>
              <li>
                <span className="font-medium">Dados Técnicos:</span> inclui endereço IP, dados de login, tipo e versão do navegador, configuração de fuso horário e localização, tipos e versões de plugins do navegador, sistema operacional e plataforma.
              </li>
              <li>
                <span className="font-medium">Dados de Perfil:</span> inclui seu nome de usuário e senha, compras ou pedidos feitos por você, seus interesses, preferências, feedback e respostas a pesquisas.
              </li>
              <li>
                <span className="font-medium">Dados de Uso:</span> inclui informações sobre como você usa nosso site, produtos e serviços.
              </li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">3. Como Usamos Seus Dados</h2>
            <p>
              Somente usaremos seus dados pessoais quando a lei nos permitir. Mais comumente, usaremos seus dados pessoais nas seguintes circunstâncias:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Onde precisamos executar o contrato que estamos prestes a celebrar ou já celebramos com você.</li>
              <li>Onde seja necessário para os nossos interesses legítimos (ou de terceiros) e seus interesses e direitos fundamentais não se sobreponham a esses interesses.</li>
              <li>Onde precisamos cumprir uma obrigação legal ou regulatória.</li>
            </ul>
            <p>
              Geralmente, não nos baseamos no consentimento como base legal para processar seus dados pessoais, exceto em relação ao envio de comunicações de marketing de terceiros para você via e-mail ou mensagem de texto.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">4. Cookies</h2>
            <p>
              Cookies são pequenos arquivos de texto que os sites colocam no seu computador para armazenar informações sobre suas preferências. Utilizamos cookies e tecnologias semelhantes para distingui-lo de outros usuários do nosso site. Isso nos ajuda a fornecer uma boa experiência quando você navega em nosso site e também nos permite melhorar nosso site.
            </p>
            <p>
              Você pode configurar seu navegador para recusar todos ou alguns cookies do navegador, ou para alertá-lo quando os sites definirem ou acessarem cookies. Se você desativar ou recusar cookies, observe que algumas partes deste site podem se tornar inacessíveis ou não funcionar adequadamente.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">5. Compartilhamento de Dados</h2>
            <p>
              Podemos compartilhar seus dados pessoais com as partes indicadas abaixo para os fins estabelecidos nesta política de privacidade:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provedores de serviços que fornecem serviços de TI e administração de sistemas.</li>
              <li>Consultores profissionais, incluindo advogados, banqueiros, auditores e seguradoras.</li>
              <li>Autoridades fiscais, reguladoras e outras autoridades.</li>
            </ul>
            <p>
              Exigimos que todos os terceiros respeitem a segurança dos seus dados pessoais e os tratem de acordo com a lei. Não permitimos que nossos provedores de serviços terceirizados usem seus dados pessoais para seus próprios fins e apenas permitimos que eles processem seus dados pessoais para fins específicos e de acordo com nossas instruções.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">6. Segurança de Dados</h2>
            <p>
              Implementamos medidas de segurança apropriadas para evitar que seus dados pessoais sejam acidentalmente perdidos, usados ou acessados de forma não autorizada, alterados ou divulgados. Além disso, limitamos o acesso aos seus dados pessoais aos funcionários, agentes, contratados e outros terceiros que tenham uma necessidade comercial de saber. Eles só processarão seus dados pessoais de acordo com nossas instruções e estão sujeitos a um dever de confidencialidade.
            </p>
            <p>
              Temos procedimentos para lidar com qualquer suspeita de violação de dados pessoais e notificaremos você e qualquer regulador aplicável sobre uma violação onde somos legalmente obrigados a fazê-lo.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">7. Seus Direitos Legais</h2>
            <p>
              Em determinadas circunstâncias, você tem direitos sob as leis de proteção de dados em relação aos seus dados pessoais, incluindo o direito de:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Solicitar acesso aos seus dados pessoais.</li>
              <li>Solicitar a correção de seus dados pessoais.</li>
              <li>Solicitar a exclusão de seus dados pessoais.</li>
              <li>Opor-se ao processamento de seus dados pessoais.</li>
              <li>Solicitar a restrição do processamento de seus dados pessoais.</li>
              <li>Solicitar a transferência de seus dados pessoais.</li>
              <li>Direito de retirar o consentimento.</li>
            </ul>
            <p>
              Se você desejar exercer qualquer um dos direitos acima, entre em contato conosco através do e-mail: <span className="text-purple-500">privacidade@synapsy.app</span>
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">8. Alterações na Política de Privacidade</h2>
            <p>
              Reservamo-nos o direito de atualizar esta política de privacidade a qualquer momento. Notificaremos você sobre quaisquer alterações publicando a nova política de privacidade nesta página e, se as alterações forem significativas, enviaremos um e-mail.
            </p>
            <p>
              É importante que os dados pessoais que mantemos sobre você sejam precisos e atuais. Por favor, mantenha-nos informados se seus dados pessoais mudarem durante seu relacionamento conosco.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">9. Contato</h2>
            <p>
              Se você tiver dúvidas sobre esta política de privacidade ou nossas práticas de privacidade, entre em contato conosco em:
            </p>
            <div className="bg-background/40 border border-purple-500/20 rounded-lg p-4 mt-4">
              <p className="font-medium">Synapsy App</p>
              <p>Email: privacidade@synapsy.app</p>
              <p>Site: www.synapsy.app</p>
            </div>
          </motion.section>
        </div>
      </div>
    </MainLayout>
  );
} 