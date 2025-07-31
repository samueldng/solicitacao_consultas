import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import '../styles/globals.css';

const RequestForm: React.FC = () => {
  const { user, logout } = useAuth();
  
  const [formData, setFormData] = useState({
    nomePaciente: '',
    cpfPaciente: '',
    cns: '',
    unidadeSolicitante: '',
    numeroCelular: '',
    tipoConsulta: '', // Novo campo para primeira consulta ou retorno
    observacao: '',
    nomeSolicitante: '',
    especialidade: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | ''>('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Função para obter o ID da unidade pelo nome
  const getUnidadeIdByName = (unitName: string): string => {
    const unidadeMap: {[key: string]: string} = {
      'Centro de Saude Aldeia': '1',
      'Centro de Saude Alto Fogoso': '2',
      'Centro de Saude Bairro Areal': '3',
      'Centro de Saude Bairro da Areia': '4',
      'Centro de Saude Bela Vista': '5',
      'Centro de Saude Bom Principio': '6',
      'Centro de Saude Brejinho': '7',
      'Centro de Saude Cohab I': '8',
      'Centro de Saude da Luziania': '9',
      'Centro de Saude do Bairro Jucaral': '10',
      'Centro de Saude do Centro': '11',
      'Centro de Saude Esperanca': '12',
      'Centro de Saude Irineu A Nogueira': '13',
      'Centro de Saude Santos Dumont': '14',
      'Centro de Saude Sao Jose das Verdades': '15',
      'Centro de Saude Seco das Mulatas': '16',
      'Centro de Saude Setubal': '17',
      'Centro de Saude Terra do Sol': '18',
      'Centro de Saude Trizidela': '19',
      'Centro de Saude Vila Nova': '20',
      'Hospital Maria Socorro Brandao': '21',
      'Hospital Materno Infantil': '22',
      'Unidade Basica de Saude Bernardo Marcelino': '23',
      'Unidade Basica de Saude Leonez Muniz Queiroz': '24',
      'Unidade Basica de Saude Pedro Alves Santos': '25',
      'Unidade de Saude do Povoado Piratininga': '26'
    };
    return unidadeMap[unitName] || '';
  };

  // useEffect para definir automaticamente a unidade do usuário logado
  useEffect(() => {
    console.log('useEffect executado - user:', user);
    if (user && user.unitName && user.username !== 'admin') {
      const unidadeId = getUnidadeIdByName(user.unitName);
      console.log('Definindo unidade:', user.unitName, '-> ID:', unidadeId);
      if (unidadeId) {
        setFormData(prev => ({
          ...prev,
          unidadeSolicitante: unidadeId
        }));
      } else {
        console.error('Unidade não encontrada no mapeamento:', user.unitName);
      }
    }
  }, [user]);

  // Função para validar CPF
  const validateCPF = (cpf: string): boolean => {
    // Remove caracteres não numéricos
    const cleanCPF = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cleanCPF.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
    
    // Validação do algoritmo do CPF
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(9))) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCPF.charAt(10))) return false;
    
    return true;
  };

  // Função para validar telefone
  const validatePhone = (phone: string): boolean => {
    // Remove caracteres não numéricos
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Verifica se tem 10 ou 11 dígitos (com ou sem 9º dígito)
    return cleanPhone.length === 10 || cleanPhone.length === 11;
  };

  // Função para formatar CPF em tempo real
  const formatCPF = (value: string): string => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedValue = cleanValue.slice(0, 11);
    
    // Aplica a formatação progressiva
    if (limitedValue.length <= 3) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return limitedValue.replace(/(\d{3})(\d+)/, '$1.$2');
    } else if (limitedValue.length <= 9) {
      return limitedValue.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
    } else {
      return limitedValue.replace(/(\d{3})(\d{3})(\d{3})(\d+)/, '$1.$2.$3-$4');
    }
  };

  // Função para formatar telefone em tempo real
  const formatPhone = (value: string): string => {
    // Remove tudo que não é dígito
    const cleanValue = value.replace(/\D/g, '');
    
    // Limita a 11 dígitos
    const limitedValue = cleanValue.slice(0, 11);
    
    // Aplica a formatação progressiva
    if (limitedValue.length <= 2) {
      return limitedValue;
    } else if (limitedValue.length <= 6) {
      return limitedValue.replace(/(\d{2})(\d+)/, '($1) $2');
    } else if (limitedValue.length <= 10) {
      return limitedValue.replace(/(\d{2})(\d{4})(\d+)/, '($1) $2-$3');
    } else {
      return limitedValue.replace(/(\d{2})(\d{5})(\d+)/, '($1) $2-$3');
    }
  };

  // Função para validar CNS - Cartão Nacional de Saúde
  const validateCNS = (cns: string): boolean => {
    // Remove todos os caracteres não numéricos
    const cleanCNS = cns.replace(/\D/g, '');
    
    if (cleanCNS.length !== 15) {
      return false;
    }
    
    // Calcula a soma ponderada
    const sum = cleanCNS
      .split('')
      .reduce((acc, digit, index) => acc + parseInt(digit) * (15 - index), 0);
    
    return sum % 11 === 0;
  };

  // Função para formatar CNS (apenas números)
  const formatCNS = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    return numbers.slice(0, 15); // Limita a 15 dígitos
  };

  // Função para validar todos os campos
  // Função para validar todos os campos
  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
  
    // Validar nome do paciente
    if (!formData.nomePaciente.trim()) {
      newErrors.nomePaciente = 'Nome do paciente é obrigatório';
    } else if (formData.nomePaciente.trim().length < 2) {
      newErrors.nomePaciente = 'Nome deve ter pelo menos 2 caracteres';
    }
  
    // Validar CPF
    if (!formData.cpfPaciente.trim()) {
      newErrors.cpfPaciente = 'CPF é obrigatório';
    } else if (!validateCPF(formData.cpfPaciente)) {
      newErrors.cpfPaciente = 'CPF inválido';
    }
  
    // Validar CNS (opcional, mas se preenchido deve ser válido)
    if (formData.cns.trim() && !validateCNS(formData.cns)) {
      newErrors.cns = 'CNS inválido - deve conter 15 dígitos válidos';
    }
  
    // Validar unidade solicitante (deve estar preenchida automaticamente)
    if (!formData.unidadeSolicitante) {
      if (!user) {
        newErrors.unidadeSolicitante = 'Erro: Usuário não está logado';
      } else if (!user.unitName) {
        newErrors.unidadeSolicitante = 'Erro: Usuário não possui unidade associada';
      } else if (user.username === 'admin') {
        newErrors.unidadeSolicitante = 'Erro: Admin deve selecionar uma unidade';
      } else {
        const unidadeId = getUnidadeIdByName(user.unitName);
        if (!unidadeId) {
          newErrors.unidadeSolicitante = `Erro: Unidade "${user.unitName}" não encontrada no mapeamento`;
        } else {
          newErrors.unidadeSolicitante = 'Erro: Unidade solicitante não identificada';
        }
      }
    }
  
    // Validar telefone
    if (!formData.numeroCelular.trim()) {
      newErrors.numeroCelular = 'Número de celular é obrigatório';
    } else if (!validatePhone(formData.numeroCelular)) {
      newErrors.numeroCelular = 'Número de telefone inválido';
    }
  
    // Validar tipo de consulta
    if (!formData.tipoConsulta) {
      newErrors.tipoConsulta = 'Tipo de consulta é obrigatório';
    }
  
    // Validar observação (obrigatória)
    if (!formData.observacao.trim()) {
      newErrors.observacao = 'Observação é obrigatória';
    }
  
    // Validar nome do solicitante
    if (!formData.nomeSolicitante.trim()) {
      newErrors.nomeSolicitante = 'Nome do solicitante é obrigatório';
    } else if (formData.nomeSolicitante.trim().length < 2) {
      newErrors.nomeSolicitante = 'Nome deve ter pelo menos 2 caracteres';
    }
  
    // Validar especialidade
    if (!formData.especialidade) {
      newErrors.especialidade = 'Especialidade é obrigatória';
    }
  
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Aplicar formatação específica em tempo real
    if (name === 'cpfPaciente') {
      formattedValue = formatCPF(value);
    } else if (name === 'cns') {
      formattedValue = formatCNS(value);
    } else if (name === 'numeroCelular') {
      formattedValue = formatPhone(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
    }));

    // Limpar erro do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar formulário antes de enviar
    if (!validateForm()) {
      setMessage('Por favor, corrija os erros antes de enviar.');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');
    setMessageType('');
    
    // URL da função Netlify (proxy)
    const proxyUrl = '/.netlify/functions/google-sheets-proxy';
    
    // Mapear IDs para nomes completos
    const unidadeNome = getUnidadeNome(formData.unidadeSolicitante);
    const especialidadeNome = getEspecialidadeNome(formData.especialidade);
    
    // Dados a serem enviados com nomes completos
    const dataToSend = {
      ...formData,
      unidadeSolicitante: unidadeNome,
      especialidade: especialidadeNome
    };
    
    // ✅ ADICIONE ESTE DEBUG AQUI:
    console.log('=== DEBUG DADOS ENVIADOS ===');
    console.log('FormData original:', formData);
    console.log('CNS no formData:', formData.cns);
    console.log('DataToSend completo:', dataToSend);
    console.log('CNS no dataToSend:', dataToSend.cns);
    console.log('===============================');
    
    try {
      const response = await axios.post(proxyUrl, dataToSend, {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000, // 15 segundos de timeout
      });
      
      if (response.data.success) {
        setMessage('Solicitação enviada com sucesso!');
        setMessageType('success');
        
        // Limpar formulário após sucesso (mantendo a unidade)
        setFormData({
          nomePaciente: '',
          cpfPaciente: '',
          cns: '', // Incluir o novo campo
          unidadeSolicitante: user?.unitName || '',
          numeroCelular: '',
          tipoConsulta: '', // Adicionar o campo que estava faltando
          observacao: '',
          nomeSolicitante: '',
          especialidade: ''
        });
        setErrors({});
      } else {
        setMessage(response.data.message || 'Erro ao enviar solicitação.');
        setMessageType('error');
      }
      
    } catch (error) {
      console.error('Erro ao enviar solicitação:', error);
      
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          setMessage('Timeout: A solicitação demorou muito para responder. Tente novamente.');
        } else if (error.response && error.response.status >= 500) {
          setMessage('Erro no servidor. Tente novamente em alguns minutos.');
        } else if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Erro ao enviar solicitação. Verifique sua conexão e tente novamente.');
        }
      } else {
        setMessage('Erro inesperado. Tente novamente.');
      }
      
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // Função para obter o nome da unidade pelo ID
  const getUnidadeNome = (id: string): string => {
    const unidades: {[key: string]: string} = {
      '1': '1 Centro de Saude Aldeia',
      '2': '2 Centro de Saude Alto Fogoso',
      '3': '3 Centro de Saude Bairro Areal',
      '4': '4 Centro de Saude Bairro da Areia',
      '5': '5 Centro de Saude Bela Vista',
      '6': '6 Centro de Saude Bom Principio',
      '7': '7 Centro de Saude Brejinho',
      '8': '8 Centro de Saude Cohab I',
      '9': '9 Centro de Saude da Luziania',
      '10': '10 Centro de Saude do Bairro Jucaral',
      '11': '11 Centro de Saude do Centro',
      '12': '12 Centro de Saude Esperanca',
      '13': '13 Centro de Saude Irineu A Nogueira',
      '14': '14 Centro de Saude Santos Dumont',
      '15': '15 Centro de Saude Sao Jose das Verdades',
      '16': '16 Centro de Saude Seco das Mulatas',
      '17': '17 Centro de Saude Setubal',
      '18': '18 Centro de Saude Terra do Sol',
      '19': '19 Centro de Saude Trizidela',
      '20': '20 Centro de Saude Vila Nova',
      '21': '21 Hospital Maria Socorro Brandao',
      '22': '22 Hospital Materno Infantil',
      '23': '23 Unidade Basica de Saude Bernardo Marcelino',
      '24': '24 Unidade Basica de Saude Leonez Muniz Queiroz',
      '25': '25 Unidade Basica de Saude Pedro Alves Santos',
      '26': '26 Unidade de Saude do Povoado Piratininga'
    };
    return unidades[id] || id;
  };

  // Função para obter o nome da especialidade pelo ID
  const getEspecialidadeNome = (id: string): string => {
    const especialidades: {[key: string]: string} = {
      '1': '1. MÉDICO CARDIOLOGISTA',
      '2': '2. MÉDICO CIRURGIÃO GERAL',
      '3': '3. MÉDICO DERMATOLOGISTA',
      '4': '4. MÉDICO GINECOLOGISTA',
      '5': '5. MÉDICO MASTOLOGISTA',
      '6': '6. MÉDICO NEFROLOGISTA',
      '7': '7. MÉDICO NEUROLOGISTA',
      '8': '8. MÉDICO OFTALMOLOGISTA',
      '9': '9. MÉDICO ORTOPEDISTA',
      '10': '10. MÉDICO OBSTETRA',
      '11': '11. MÉDICO PEDIATRA',
      '12': '12. MÉDICO PROCTOLOGISTA',
      '13': '13. MÉDICO PSIQUIATRA',
      '14': '14. MÉDICO UROLOGISTA'
    };
    return especialidades[id] || id;
  };

  // Função para lidar com o logout
  const handleLogout = () => {
    logout();
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '800px', margin: '20px auto' }}>
        {/* Cabeçalho com botão de logout */}
        <div style={{ position: 'relative', marginBottom: '30px' }}>
          <button 
            type="button" 
            onClick={handleLogout}
            style={{ 
              position: 'absolute',
              top: '0',
              right: '0',
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              zIndex: 1
            }}
          >
            Sair do Sistema
          </button>
          
          <div style={{ textAlign: 'center' }}>
            <img 
              src="/logo-nova-bacabal.png" 
              alt="Nova Bacabal - Secretaria de Saúde" 
              className="logo"
              style={{
                maxWidth: '280px',
                width: '100%',
                height: 'auto',
                marginBottom: '20px'
              }}
            />
            <h2 style={{ color: 'var(--dark-gray)', marginBottom: '10px' }}>
              Solicitação de Consulta Especializada
            </h2>
            <p style={{ color: 'var(--medium-gray)', fontSize: '16px' }}>
              Preencha todos os campos obrigatórios para solicitar uma consulta
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {message && (
            <div className={`alert ${messageType === 'success' ? 'alert-success' : 'alert-error'}`}>
              {message}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="nomePaciente" className="form-label">
              Nome do Paciente <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="nomePaciente"
              name="nomePaciente"
              className={`form-input ${errors.nomePaciente ? 'error' : ''}`}
              value={formData.nomePaciente}
              onChange={handleChange}
              placeholder="Digite o nome completo do paciente"
              required
              disabled={loading}
            />
            {errors.nomePaciente && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.nomePaciente}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cpfPaciente" className="form-label">
              CPF do Paciente <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="cpfPaciente"
              name="cpfPaciente"
              className={`form-input ${errors.cpfPaciente ? 'error' : ''}`}
              value={formData.cpfPaciente}
              onChange={handleChange}
              placeholder="000.000.000-00"
              required
              disabled={loading}
            />
            {errors.cpfPaciente && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.cpfPaciente}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="cns" className="form-label">
              CNS - Cartão Nacional de Saúde
            </label>
            <input
              type="text"
              id="cns"
              name="cns"
              className={`form-input ${errors.cns ? 'error' : ''}`}
              value={formData.cns}
              onChange={handleChange}
              placeholder="000000000000000 (15 dígitos)"
              disabled={loading}
              maxLength={15}
            />
            {errors.cns && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.cns}
              </div>
            )}
            <div style={{ color: 'var(--medium-gray)', fontSize: '12px', marginTop: '5px' }}>
              Campo opcional - Digite apenas números (15 dígitos)
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Unidade Solicitante
            </label>
            <div 
              className="form-input" 
              style={{ 
                backgroundColor: 'var(--light-gray)', 
                color: 'var(--dark-gray)',
                border: '2px solid var(--medium-gray)',
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                minHeight: '50px'
              }}
            >
              {user?.unitName || 'Unidade não identificada'}
            </div>
            {errors.unidadeSolicitante && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.unidadeSolicitante}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="numeroCelular" className="form-label">
              Número de Celular do Paciente <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="tel"
              id="numeroCelular"
              name="numeroCelular"
              className={`form-input ${errors.numeroCelular ? 'error' : ''}`}
              value={formData.numeroCelular}
              onChange={handleChange}
              placeholder="(00) 00000-0000"
              required
              disabled={loading}
            />
            {errors.numeroCelular && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.numeroCelular}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tipoConsulta" className="form-label">
              Tipo de Consulta <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="tipoConsulta"
              name="tipoConsulta"
              className={`form-input ${errors.tipoConsulta ? 'error' : ''}`}
              value={formData.tipoConsulta}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Selecione o tipo de consulta</option>
              <option value="primeira">Primeira Consulta</option>
              <option value="retorno">Retorno</option>
            </select>
            {errors.tipoConsulta && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.tipoConsulta}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="nomeSolicitante" className="form-label">
              Nome do Solicitante <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              type="text"
              id="nomeSolicitante"
              name="nomeSolicitante"
              className={`form-input ${errors.nomeSolicitante ? 'error' : ''}`}
              value={formData.nomeSolicitante}
              onChange={handleChange}
              placeholder="Digite o nome do profissional solicitante"
              required
              disabled={loading}
            />
            {errors.nomeSolicitante && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.nomeSolicitante}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="especialidade" className="form-label">
              Especialidade <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <select
              id="especialidade"
              name="especialidade"
              className={`form-input ${errors.especialidade ? 'error' : ''}`}
              value={formData.especialidade}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">Selecione a especialidade</option>
              <option value="1">1. MÉDICO CARDIOLOGISTA</option>
              <option value="2">2. MÉDICO CIRURGIÃO GERAL</option>
              <option value="3">3. MÉDICO DERMATOLOGISTA</option>
              <option value="4">4. MÉDICO GINECOLOGISTA</option>
              <option value="5">5. MÉDICO MASTOLOGISTA</option>
              <option value="6">6. MÉDICO NEFROLOGISTA</option>
              <option value="7">7. MÉDICO NEUROLOGISTA</option>
              <option value="8">8. MÉDICO OFTALMOLOGISTA</option>
              <option value="9">9. MÉDICO ORTOPEDISTA</option>
              <option value="10">10. MÉDICO OBSTETRA</option>
              <option value="11">11. MÉDICO PEDIATRA</option>
              <option value="12">12. MÉDICO PROCTOLOGISTA</option>
              <option value="13">13. MÉDICO PSIQUIATRA</option>
              <option value="14">14. MÉDICO UROLOGISTA</option>
            </select>
            {errors.especialidade && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.especialidade}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="observacao" className="form-label">
              Observação <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <textarea
              id="observacao"
              name="observacao"
              className={`form-input ${errors.observacao ? 'error' : ''}`}
              value={formData.observacao}
              onChange={handleChange}
              placeholder="Informações adicionais sobre a solicitação"
              rows={4}
              required
              disabled={loading}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />
            {errors.observacao && (
              <div style={{ color: 'var(--danger)', fontSize: '14px', marginTop: '5px' }}>
                {errors.observacao}
              </div>
            )}
          </div>

          <div style={{ textAlign: 'center', marginTop: '30px' }}>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '200px' }}
            >
              {loading ? 'Enviando...' : 'Enviar Solicitação'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Rodapé com assinatura do setor */}
      <footer style={{
        textAlign: 'center',
        marginTop: '30px',
        padding: '20px',
        borderTop: '1px solid #e0e0e0',
        color: '#666',
        fontSize: '14px'
      }}>
        © 2025 Superintendência de T.I
      </footer>
    </div>
  );
};

export default RequestForm;

  
