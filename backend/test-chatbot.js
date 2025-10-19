// Script de prueba para el Chatbot con OpenAI
// Ejecutar: node test-chatbot.js

require('dotenv').config();
const { generateChatResponse, testConnection } = require('./src/config/openai');

async function testChatbot() {
  console.log('🤖 Probando Chatbot con OpenAI...\n');

  // 1. Probar conexión
  console.log('1️⃣ Probando conexión con OpenAI...');
  const connection = await testConnection();
  
  if (connection.success) {
    console.log('✅ Conexión exitosa:', connection.message);
  } else {
    console.log('❌ Error de conexión:', connection.error);
    return;
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 2. Probar pregunta simple
  console.log('2️⃣ Probando pregunta simple...');
  const messages1 = [
    { role: 'user', content: '¿Cómo crear una cotización?' }
  ];

  const response1 = await generateChatResponse(messages1);
  
  if (response1.success) {
    console.log('✅ Respuesta del chatbot:');
    console.log(response1.message);
    console.log('\n📊 Uso de tokens:', response1.usage.totalTokens);
    console.log('💰 Costo estimado: $' + response1.usage.estimatedCost);
  } else {
    console.log('❌ Error:', response1.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 3. Probar pregunta sobre materiales
  console.log('3️⃣ Probando pregunta sobre materiales...');
  const messages2 = [
    { role: 'user', content: 'Necesito cemento para una casa de 150m²' }
  ];

  const response2 = await generateChatResponse(messages2);
  
  if (response2.success) {
    console.log('✅ Respuesta del chatbot:');
    console.log(response2.message);
    console.log('\n📊 Uso de tokens:', response2.usage.totalTokens);
    console.log('💰 Costo estimado: $' + response2.usage.estimatedCost);
  } else {
    console.log('❌ Error:', response2.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // 4. Probar conversación con contexto
  console.log('4️⃣ Probando conversación con contexto...');
  const messages3 = [
    { role: 'user', content: '¿Qué proveedores tienen fierros?' },
    { role: 'assistant', content: 'Los principales proveedores con fierros son Sodimac, Easy, Construmart e Imperial. Imperial es especialista en fierros.' },
    { role: 'user', content: '¿Cuál es el más barato?' }
  ];

  const context = {
    user: { name: 'Juan', role: 'admin' },
    currentPage: '/buscador'
  };

  const response3 = await generateChatResponse(messages3, context);
  
  if (response3.success) {
    console.log('✅ Respuesta del chatbot:');
    console.log(response3.message);
    console.log('\n📊 Uso de tokens:', response3.usage.totalTokens);
    console.log('💰 Costo estimado: $' + response3.usage.estimatedCost);
  } else {
    console.log('❌ Error:', response3.error);
  }

  console.log('\n' + '='.repeat(50) + '\n');
  console.log('🎉 Pruebas completadas!\n');
}

// Ejecutar pruebas
testChatbot().catch(console.error);
