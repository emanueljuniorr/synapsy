'use client';

import MainLayout from '@/components/layout/MainLayout';
import { motion } from 'framer-motion';

export default function TermsOfServicePage() {
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
            Termos de Uso
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
              Bem-vindo ao Synapsy. Estes Termos de Uso regem seu acesso e uso do site Synapsy, aplicativos móveis e serviços relacionados (coletivamente, os "Serviços"). Ao acessar ou usar nossos Serviços, você concorda com estes Termos de Uso. Se você não concorda com estes termos, por favor, não use nossos Serviços.
            </p>
            <p>
              Os Serviços são operados por Synapsy App ("nós", "nosso" ou "Synapsy"). Oferecemos uma plataforma digital para produtividade, planejamento e um ambiente de estudos, concentração e foco.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">2. Contas de Usuário</h2>
            <p>
              Para usar determinados recursos dos Serviços, você deve criar uma conta. Você é responsável por manter a confidencialidade de sua senha e informações da conta, e por todas as atividades que ocorrem em sua conta. Notifique-nos imediatamente sobre qualquer uso não autorizado de sua conta.
            </p>
            <p>
              Ao criar uma conta, você concorda em fornecer informações precisas, atuais e completas. Você é responsável por atualizar suas informações para mantê-las precisas, atuais e completas.
            </p>
            <p>
              Reservamo-nos o direito de suspender ou encerrar sua conta e seu uso dos Serviços se descobrirmos que você forneceu informações imprecisas, desatualizadas ou incompletas, ou se você estiver violando estes Termos de Uso.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">3. Assinaturas e Pagamentos</h2>
            <p>
              O Synapsy oferece diferentes planos de assinatura, incluindo um plano Free com recursos limitados e um plano Pro com recursos avançados.
            </p>
            <h3 className="text-xl font-medium text-purple-400 mt-4">3.1. Plano Free</h3>
            <p>
              O plano Free do Synapsy oferece recursos básicos da plataforma sem custo. Este plano tem limitações nos recursos disponíveis, incluindo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Número limitado de notas</li>
              <li>Número limitado de tarefas</li>
              <li>Número limitado de materiais de estudo</li>
              <li>Acesso limitado a recursos premium</li>
            </ul>

            <h3 className="text-xl font-medium text-purple-400 mt-4">3.2. Plano Pro</h3>
            <p>
              O plano Pro do Synapsy é uma assinatura paga que oferece acesso a todos os recursos da plataforma, incluindo:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Notas e tarefas ilimitadas</li>
              <li>Acesso a todos os módulos de estudo</li>
              <li>Recursos exclusivos (modos de foco e relaxamento)</li>
              <li>Prioridade no suporte ao cliente</li>
            </ul>

            <h3 className="text-xl font-medium text-purple-400 mt-4">3.3. Pagamentos e Renovação</h3>
            <p>
              Ao assinar o plano Pro, você concorda em pagar todas as taxas aplicáveis pelo período de assinatura selecionado. As assinaturas são renovadas automaticamente no final de cada período até que você cancele.
            </p>
            <p>
              Os preços das assinaturas podem mudar ao longo do tempo. Notificaremos você sobre qualquer alteração de preço com antecedência razoável. Ao continuar a usar os Serviços após uma alteração de preço entrar em vigor, você concorda em pagar o preço atualizado.
            </p>

            <h3 className="text-xl font-medium text-purple-400 mt-4">3.4. Cancelamento</h3>
            <p>
              Você pode cancelar sua assinatura a qualquer momento através da seção de configurações da sua conta. O cancelamento entrará em vigor no final do período de faturamento atual. Não há reembolsos para pagamentos já processados.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">4. Conteúdo do Usuário</h2>
            <p>
              Nossos Serviços permitem que você armazene, compartilhe e publique vários conteúdos, incluindo textos, imagens e outros materiais ("Conteúdo do Usuário"). Você mantém todos os direitos de propriedade intelectual sobre o Conteúdo do Usuário que você envia, publica ou exibe em ou através dos Serviços.
            </p>
            <p>
              Ao enviar, publicar ou exibir Conteúdo do Usuário, você nos concede uma licença mundial, não exclusiva, transferível, sublicenciável, livre de royalties para usar, reproduzir, distribuir, preparar trabalhos derivados, exibir e executar esse Conteúdo do Usuário em conexão com a prestação dos Serviços.
            </p>
            <p>
              Você é o único responsável por todo o Conteúdo do Usuário que você fornece e pelas consequências de compartilhá-lo ou publicá-lo. Você declara e garante que:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Possui ou tem as licenças, direitos, consentimentos e permissões necessários para usar e autorizar o uso de seu Conteúdo do Usuário conforme contemplado nos Serviços e nestes Termos.</li>
              <li>Seu Conteúdo do Usuário não infringe ou se apropria indevidamente de direitos de propriedade intelectual ou outros direitos de propriedade de terceiros.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">5. Conduta Proibida</h2>
            <p>
              Você concorda em não usar os Serviços para:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Violar qualquer lei aplicável, contrato, propriedade intelectual ou outros direitos de terceiros.</li>
              <li>Enviar, postar ou compartilhar qualquer material ilegal, difamatório, pornográfico, obsceno, ofensivo, ameaçador, assediador, abusivo ou odioso.</li>
              <li>Enviar ou distribuir vírus, malware ou outro código prejudicial.</li>
              <li>Tentar acessar não autorizadamente ou prejudicar os sistemas ou redes de computadores associados aos Serviços.</li>
              <li>Coletar informações de usuários sem consentimento adequado.</li>
              <li>Usar os Serviços de forma que possa desativar, sobrecarregar ou prejudicar os Serviços (como ataques de negação de serviço).</li>
              <li>Usar qualquer robô, spider, crawler, scraper ou outros meios automatizados para acessar os Serviços para qualquer finalidade sem nossa permissão expressa por escrito.</li>
            </ul>
            <p>
              Reservamo-nos o direito de investigar e tomar as medidas legais apropriadas contra qualquer pessoa que, a nosso critério, viole esta disposição.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">6. Propriedade Intelectual</h2>
            <p>
              Os Serviços e todo o conteúdo neles originados, excluindo o Conteúdo do Usuário, são de propriedade do Synapsy ou de seus licenciadores e são protegidos por leis de direitos autorais, marcas registradas e outras leis de propriedade intelectual.
            </p>
            <p>
              Nossos logotipos, nomes de produtos e serviços são marcas registradas do Synapsy. Você não deve exibir, usar ou registrar qualquer nome, logotipo, URL ou outro identificador que contenha nossas marcas ou que seja confusamente similar a elas.
            </p>
            <p>
              Concedemos a você uma licença limitada, não exclusiva, não transferível e revogável para usar os Serviços para seus fins pessoais ou comerciais internos, sujeita a estes Termos.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">7. Limitação de Responsabilidade</h2>
            <p>
              Na extensão máxima permitida pela lei aplicável, o Synapsy e seus funcionários, agentes, afiliados e parceiros não serão responsáveis por:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Quaisquer danos indiretos, incidentais, especiais, consequenciais ou punitivos, incluindo perda de lucros, perda de dados, interrupção de negócios ou qualquer outra perda comercial.</li>
              <li>Qualquer perda ou dano que não seja razoavelmente previsível.</li>
              <li>Qualquer perda ou dano decorrente de qualquer conteúdo publicado, transmitido ou disponibilizado através dos Serviços.</li>
              <li>Qualquer conduta ou conteúdo de terceiros na plataforma.</li>
            </ul>
            <p>
              Nossa responsabilidade total para com você por todas as reivindicações decorrentes ou relacionadas aos Serviços não excederá o valor pago por você ao Synapsy nos últimos 12 meses.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">8. Indenização</h2>
            <p>
              Você concorda em defender, indenizar e isentar o Synapsy e seus funcionários, diretores, agentes, parceiros e afiliados de qualquer reivindicação, responsabilidade, dano, custo e despesa (incluindo honorários advocatícios razoáveis) decorrentes ou relacionados de alguma forma a:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Seu uso dos Serviços.</li>
              <li>Seu Conteúdo do Usuário.</li>
              <li>Sua violação destes Termos.</li>
              <li>Sua violação de qualquer direito de terceiros.</li>
            </ul>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.0 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">9. Alterações nos Serviços e Termos</h2>
            <p>
              Reservamo-nos o direito de modificar, suspender ou descontinuar os Serviços (ou qualquer parte deles) a qualquer momento, com ou sem aviso prévio. Não seremos responsáveis perante você ou qualquer terceiro por qualquer modificação, suspensão ou descontinuação dos Serviços.
            </p>
            <p>
              Podemos atualizar estes Termos de tempos em tempos. Se fizermos alterações materiais, notificaremos você através do e-mail associado à sua conta ou através de um aviso em destaque nos Serviços. Seu uso continuado dos Serviços após tais alterações constitui sua aceitação dos Termos revisados.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">10. Lei Aplicável e Resolução de Disputas</h2>
            <p>
              Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus princípios de conflito de leis.
            </p>
            <p>
              Qualquer disputa, controvérsia ou reivindicação decorrente ou relacionada a estes Termos, ou a violação, rescisão ou invalidade dos mesmos, será resolvida por arbitragem de acordo com as Regras de Arbitragem da Câmara de Comércio Brasil-Canadá. O tribunal arbitral será composto por um único árbitro. O local da arbitragem será São Paulo, Brasil. O idioma da arbitragem será o português.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">11. Disposições Gerais</h2>
            <p>
              Estes Termos, juntamente com nossa Política de Privacidade e quaisquer outros acordos expressamente incorporados por referência, constituem o acordo completo entre você e o Synapsy em relação aos Serviços.
            </p>
            <p>
              Se qualquer disposição destes Termos for considerada inexequível ou inválida, essa disposição será limitada ou eliminada na extensão mínima necessária para que os Termos permaneçam em pleno vigor e efeito.
            </p>
            <p>
              Nossa falha em fazer valer qualquer direito ou disposição destes Termos não será considerada uma renúncia de tal direito ou disposição.
            </p>
            <p>
              Você não pode ceder ou transferir estes Termos, por força de lei ou de outra forma, sem nosso consentimento prévio por escrito. Podemos ceder estes Termos sem restrições.
            </p>
          </motion.section>

          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-semibold text-purple-500">12. Contato</h2>
            <p>
              Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco em:
            </p>
            <div className="bg-background/40 border border-purple-500/20 rounded-lg p-4 mt-4">
              <p className="font-medium">Synapsy App</p>
              <p>Email: termos@synapsy.app</p>
              <p>Site: www.synapsy.app</p>
            </div>
          </motion.section>
        </div>
      </div>
    </MainLayout>
  );
} 