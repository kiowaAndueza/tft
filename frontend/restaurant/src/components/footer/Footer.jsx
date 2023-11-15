import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPhone, faEnvelope } from '@fortawesome/free-solid-svg-icons';
import { FaTwitter, FaInstagram, FaFacebook } from 'react-icons/fa';

function Footer() {
  return (
    <footer className="text-center text-lg-start" style={{ backgroundColor: '#EB7349' }}>
      <div className="container p-4">
        <div className="row">
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5 className="text-uppercase">Acerca de Gastronet</h5>
            <p>
              Gastronet es una plataforma de búsqueda y reserva de restaurantes que te permite encontrar y reservar fácilmente una mesa en tu restaurante favorito.
            </p>
          </div>
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5 className="text-uppercase">Enlaces rápidos</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="/home" className="text-dark">Inicio</a>
              </li>
              <li>
                <a href="/contact" className="text-dark">Contacto</a>
              </li>
              <li>
                <a href="/terminos-de-uso.pdf" className="text-dark">Términos de uso</a>
              </li>
              <li>
                <a href='/politica-de-privacidad.pdf' className='text-dark'>Política de privacidad</a>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5 className="text-uppercase">Contacto</h5>
            <ul className="list-unstyled mb-0">
              <li>
                <a href="#!" className="text-dark"><FontAwesomeIcon icon={faEnvelope} /> info.gastronet@gmail.com</a>
              </li>
            </ul>
          </div>
          <div className="col-lg-3 col-md-6 mb-4 mb-md-0">
            <h5 className="text-uppercase mb-0">Síguenos en redes sociales</h5>
            <ul className="list-unstyled">
              <li>
                <a href="https://www.facebook.com/profile.php?id=61551494452188" className="text-dark"><FaFacebook /> GastroNet</a>
              </li>
              <li>
                <a href="https://twitter.com/GastronetS34069" className="text-dark"><FaTwitter /> @GastronetS34069</a>
              </li>
              <li>
                <a href="#!" className="text-dark"><FaInstagram /></a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="text-center p-3" style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        Derechos reservados &copy; 2023 | Gastronet
      </div>
    </footer>
  );
}

export default Footer;