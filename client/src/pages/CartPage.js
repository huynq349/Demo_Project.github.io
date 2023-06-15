import React, { useState, useEffect } from 'react';
import Layout from './../components/Layout/Layout';
import { useCart } from '../context/cart';
import { useAuth } from '../context/auth';
import { useNavigate } from 'react-router-dom';
import DropIn from 'braintree-web-drop-in-react';
import { AiFillWarning } from 'react-icons/ai';
import axios from 'axios';
import toast from 'react-hot-toast';
import '../styles/CartStyles.css';

const CartPage = () => {
  const [auth, setAuth] = useAuth();
  const [cart, setCart] = useCart();
  const [clientToken, setClientToken] = useState('');
  const [instance, setInstance] = useState('');
  // const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  //total price
  const totalPrice = () => {
    try {
      let total = 0;
      cart?.map((item) => {
        total = total + item.price;
      });
      return total.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
      });
    } catch (error) {
      console.log(error);
    }
  };
  //detele item
  const removeCartItem = (pid) => {
    try {
      let myCart = [...cart];
      let index = myCart.findIndex((item) => item._id === pid);
      myCart.splice(index, 1);
      setCart(myCart);
      localStorage.setItem('cart', JSON.stringify(myCart));
    } catch (error) {
      console.log(error);
    }
  };

  // get payment gateway token
  // const getToken = async () => {
  //   try {
  //     const { data } = await axios.get('/api/v1/product/token');
  //     setClientToken(data?.clientToken);
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };
  // useEffect(() => {
  //   getToken();
  // }, [auth?.token]);

  //handle payments
  const handlePayment = async () => {
    try {
      // const { nonce } = await instance.requestPaymentMethod();
      const { data } = await axios.post('/api/v1/product/payment', {
        // nonce,
        cart,
      });
      console.log(data);

      localStorage.removeItem('cart');
      setCart([]);
      navigate('/dashboard/user/orders');
      toast.success('Xác nhận đơn hàng thành công ');
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <Layout>
      <div className=" cart-page">
        <div className="row">
          <div className="col-md-12">
            <h1 className="text-center bg-light p-2 mb-1">
              Xin chào quý khách
              <p className="text-center">
                {cart?.length
                  ? `Bạn có ${cart.length} Sản phẩm trong giả hàng ${
                      auth?.token ? '' : 'Xin đăng nhập để thanh toán !'
                    }`
                  : 'Bản chưa thêm sản phẩm nào !'}
              </p>
            </h1>
          </div>
        </div>
        <div className="container ">
          <div className="row ">
            <div className="col-md-7  p-0 m-0">
              {cart?.map((p) => (
                <div className="row card flex-row" key={p._id}>
                  <div className="col-md-4">
                    <img
                      src={`/api/v1/product/product-photo/${p._id}`}
                      className="card-img-top"
                      alt={p.name}
                      width="100%"
                      height={'130px'}
                    />
                  </div>
                  <div className="col-md-4">
                    <p>{p.name}</p>
                    <p>{p.description.substring(0, 30)}</p>
                    <p>
                      Giá :{' '}
                      {p.price.toLocaleString('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                      })}
                    </p>
                  </div>
                  <div className="col-md-4 cart-remove-btn">
                    <button
                      className="btn btn-danger"
                      onClick={() => removeCartItem(p._id)}
                    >
                      Xóa bỏ
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-md-5 cart-summary ">
              <h2>Giỏ hàng</h2>
              <p>Tổng tiền | Thanh toán | Phương thức thanh toán</p>
              <hr />
              <h4>Tổng tiền : {totalPrice()} </h4>
              {auth?.user?.address ? (
                <>
                  <div className="mb-3">
                    <h4>Đại chỉ hiện tại</h4>
                    <h5>{auth?.user?.address}</h5>
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate('/dashboard/user/profile')}
                    >
                      Cập nhật địa chỉ
                    </button>
                  </div>
                </>
              ) : (
                <div className="mb-3">
                  {auth?.token ? (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() => navigate('/dashboard/user/profile')}
                    >
                      Cập nhật địa chỉ
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning"
                      onClick={() =>
                        navigate('/login', {
                          state: '/cart',
                        })
                      }
                    >
                      Xin đăng nhập để thanh toán
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2">
                {!auth?.token || !cart?.length ? (
                  ''
                ) : (
                  <>
                    <DropIn
                      options={{
                        authorization: clientToken,
                        paypal: {
                          flow: 'vault',
                        },
                      }}
                      onInstance={(instance) => setInstance(instance)}
                    />

                    <button
                      className="btn btn-primary"
                      onClick={handlePayment}
                      disabled={!auth?.user?.address}
                    >
                      Make Payment
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage;
